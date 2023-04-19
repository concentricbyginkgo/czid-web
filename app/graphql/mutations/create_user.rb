class Mutations::CreateUser < Mutations::BaseMutation
  include GraphqlAuthHelpers

  field :email, String, null: true
  field :name, String, null: true
  field :institution, String, null: true
  field :archetypes, String, null: true
  field :segments, String, null: true
  field :role, Int, null: true
  field :sendActivation, Boolean, null: true

  def resolve(email:, name: nil, institution: nil, archetypes: nil, segments: nil, send_activation: false, role: 0)
    auto_account_creation_enabled = AppConfigHelper.get_app_config(AppConfig::AUTO_ACCOUNT_CREATION_V1) == "1"
    current_user = context[:current_user]

    # This endpoint is not called in the project-invite flow,
    # so it is not accessible by non-admin users.
    if current_user_is_admin?(context)
      @user = UserFactoryService.call(
        current_user: current_user,
        created_by_user_id: current_user.id,
        email: email,
        name: name,
        institution: institution,
        archetypes: archetypes,
        segments: segments,
        role: role,
        send_activation: send_activation,
        # All users created via /users/new are considered to have completed a profile form
        profile_form_version: 1,
        signup_path: User::SIGNUP_PATH[:general]
      )
    elsif !current_user_is_logged_in?(context) && auto_account_creation_enabled
      existing_user = User.find_by(email: email)
      if existing_user
        raise GraphQL::ExecutionError, "Email has already been taken"
      end

      @user = UserFactoryService.call(
        email: email,
        role: 0,
        send_activation: true,
        signup_path: User::SIGNUP_PATH[:self_registered]
      )
    else
      raise GraphQL::ExecutionError, "Permission denied"
    end
  end
end
