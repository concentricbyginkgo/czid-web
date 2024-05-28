# frozen_string_literal: true

# Generated by https://github.com/chanzuckerberg/idseq/blob/main/scripts/generate_host_genome.py

class AddHostGenomeLemurCatta < ActiveRecord::Migration[6.1]
  def up
    return if HostGenome.find_by(name: "Lemur catta - ring-tailed lemur")

    hg = HostGenome.new
    hg.name = "Lemur catta - ring-tailed lemur"
    hg.s3_star_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/lemur_catta/2024-04-23/host-genome-generation-1/lemur_catta_STAR_genome.tar"
    hg.s3_bowtie2_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/lemur_catta/2024-04-23/host-genome-generation-1/lemur_catta.bowtie2.tar"
    hg.s3_minimap2_dna_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/lemur_catta/2024-04-23/host-genome-generation-1/lemur_catta_dna.mmi"
    hg.s3_minimap2_rna_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/lemur_catta/2024-04-23/host-genome-generation-1/lemur_catta_rna.mmi"
    hg.s3_hisat2_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/lemur_catta/2024-04-23/host-genome-generation-1/lemur_catta.hisat2.tar"
    hg.s3_kallisto_index_path = "s3://#{S3_DATABASE_BUCKET}/host_filter/lemur_catta/2024-04-23/host-genome-generation-1/lemur_catta.kallisto.idx"
    hg.s3_bowtie2_index_path_v2 = "s3://#{S3_DATABASE_BUCKET}/host_filter/lemur_catta/2024-04-23/host-genome-generation-1/lemur_catta.bowtie2.tar"
    hg.skip_deutero_filter = 1 # this is set to 1 because the host is a deuterostome

    hg.default_background_id = nil
    hg.save!
  end

  def down
    hg = HostGenome.find_by(name: "Lemur catta - ring-tailed lemur")
    hg.destroy! if hg
  end
end