# frozen_string_literal: true

# Generated by https://github.com/chanzuckerberg/idseq/blob/main/scripts/generate_host_genome.py

class AddHostGenomePapaya < ActiveRecord::Migration[6.1]
  def up
    return if HostGenome.find_by(name: "Papaya")

    hg = HostGenome.new
    hg.name = "Papaya"
    hg.s3_star_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/papaya/2024-03-05/host-genome-generation-1/papaya_STAR_genome.tar"
    hg.s3_bowtie2_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/papaya/2024-03-05/host-genome-generation-1/papaya.bowtie2.tar"
    hg.s3_minimap2_dna_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/papaya/2024-03-05/host-genome-generation-1/papaya_dna.mmi"
    hg.s3_minimap2_rna_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/papaya/2024-03-05/host-genome-generation-1/papaya_rna.mmi"
    hg.s3_hisat2_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/papaya/2024-03-05/host-genome-generation-1/papaya.hisat2.tar"
    hg.s3_kallisto_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/papaya/2024-03-05/host-genome-generation-1/papaya.kallisto.idx"
    hg.s3_bowtie2_index_path_v2 = "s3://#{S3_DATABASE_BUCKET}/host_filter/papaya/2024-03-05/host-genome-generation-1/papaya.bowtie2.tar"
    hg.skip_deutero_filter = 0 # this is set to 0 because the host is not a deuterostome

    hg.default_background_id = nil
    hg.save!
  end

  def down
    hg = HostGenome.find_by(name: "Papaya")
    hg.destroy! if hg
  end
end