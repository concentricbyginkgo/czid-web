class IdentityController < ApplicationController
  before_action :login_required, only: [:identify]

  TOKEN_AUTH_SERVICE = "scripts/token_auth.py".freeze

  class TokenCreationError < StandardError
    def initialize(error = "")
      msg = "Invalid token received"
      msg += "Error: #{error}" if error.present?
      super(msg)
    end
  end

  class InvalidTokenError < StandardError
    def initialize(error = "")
      msg = "Invalid token received"
      msg += "Error: #{error}" if error.present?
      super(msg)
    end
  end

  class ExpiredTokenReceivedError < StandardError
    def initialize
      super("Expired token received")
    end
  end

  class TokenNotFoundError < StandardError
    def initialize
      super("Token not found. Please ensure you have a token when making a request.")
    end
  end

  class InvalidAuthorizationScheme < StandardError
    def initialize
      super("Invalid Authorization scheme provided. Please use Bearer.")
    end
  end

  def identify
    token = generate_token(current_user.id)
    expires_at = Time.zone.at(token["expires_at"])

    cookies[:czid_services_token] = {
      value: token["token"],
      expires: expires_at,
    }

    render json: { expires_at: expires_at }, status: :ok
  end

  def enrich_token
    user_id = validate_token

    # Enrich the token with project roles & return it as payload
    project_roles = user_project_access(user_id)
    enriched_token = generate_token(user_id, project_roles)
    render json: {
      token: enriched_token["token"],
    }, status: :ok
  end

  private

  # Fetches the token & validates it. Returns the user_id if valid.
  def validate_token
    # Get the current token from the Authorization header
    authorization_scheme, encrypted_token = request.authorization&.split(" ")
    raise TokenNotFoundError if encrypted_token.blank?
    raise InvalidAuthorizationScheme unless authorization_scheme == "Bearer"

    # Decrypt the token
    decrypted_token = decrypt_token(encrypted_token)
    user_id, expires = decrypted_token.values_at("sub", "exp")

    # Check if the token is expired
    token_expiration_time = Time.zone.at(expires)
    current_time = Time.zone.now
    if token_expiration_time < current_time
      raise ExpiredTokenReceivedError
    end

    user_id
  end

  def decrypt_token(token)
    stdout, stderr, status = Open3.capture3(
      "python3", TOKEN_AUTH_SERVICE, "--decrypt_token",
      "--token", token
    )

    unless status.success?
      LogUtil.log_error(InvalidTokenError.new(stderr))
      raise InvalidTokenError
    end

    JSON.parse(stdout)
  end

  def generate_token(user_id, project_claims = nil)
    # Verify the user_id provided is valid before generating a token
    user_id = User.find(user_id).id.to_s
    cmd = "python3 #{TOKEN_AUTH_SERVICE} --create_token --userid #{user_id}"
    cmd += " --project-claims '#{project_claims.to_json}'" if project_claims.present?
    stdout, stderr, status = Open3.capture3(cmd)

    unless status.success?
      LogUtil.log_error(TokenCreationError.new(stderr))
      raise TokenCreationError
    end

    JSON.parse(stdout)
  end

  def user_project_access(user_id)
    # There are 3 levels of access in a project:
    # 1. Project owner - the user created the project. A project can only have owner
    # 2. Project member - the user is a member of the project. A project can have many members.
    # 3. Project viewer - the user can view the project. All users can view public projects.
    user = User.find(user_id)

    project_roles = {}
    owner = Project.where(creator_id: user.id).pluck(:id).index_with { "owner" }
    member = Project.editable(user).pluck(:id).index_with { "member" }
    viewer = Project.viewable(user).pluck(:id).index_with { "viewer" }

    [owner, member, viewer].each do |hash|
      hash.each do |key, val|
        project_roles.key?(key) ? project_roles[key] << val : project_roles[key] = [val]
      end
    end

    project_roles
  end
end
