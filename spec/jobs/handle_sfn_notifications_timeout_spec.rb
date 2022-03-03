require "rails_helper"

RSpec.describe HandleSfnNotificationsTimeout, type: :job do
  subject { HandleSfnNotificationsTimeout.perform }

  describe "#perform" do
    let(:project) { create(:project) }
    let(:sample) { create(:sample, project: project) }

    let(:run1) { create(:workflow_run, sample: sample, status: WorkflowRun::STATUS[:running], executed_at: 5.hours.ago) }
    let(:run2) { create(:workflow_run, sample: sample, status: WorkflowRun::STATUS[:succeeded], executed_at: 25.hours.ago) }
    let(:run3) { create(:workflow_run, sample: sample, status: WorkflowRun::STATUS[:running], executed_at: 25.hours.ago) }
    let(:run4) { create(:workflow_run, sample: sample, status: WorkflowRun::STATUS[:running], executed_at: 2.days.ago) }

    let(:run5) { create(:pipeline_run, sample: sample, job_status: PipelineRun::STATUS_RUNNING, executed_at: 5.hours.ago) }
    let(:run6) { create(:pipeline_run, sample: sample, job_status: PipelineRun::STATUS_CHECKED, executed_at: 25.hours.ago) }
    let(:run7) { create(:pipeline_run, sample: sample, job_status: PipelineRun::STATUS_RUNNING, executed_at: 25.hours.ago) }

    context "when there are no overdue runs" do
      it "does nothing" do
        _ = [run1, run2, run5, run6]

        expect(subject).to eq(0)
        expect(run1.reload.status).to eq(WorkflowRun::STATUS[:running])
        expect(run2.reload.status).to eq(WorkflowRun::STATUS[:succeeded])
        expect(run5.reload.job_status).to eq(PipelineRun::STATUS_RUNNING)
        expect(run6.reload.job_status).to eq(PipelineRun::STATUS_CHECKED)
      end
    end

    context "when there are overdue runs" do
      it "marks overdue workflow runs as failed" do
        _ = [run1, run2, run3, run4]

        expect(CloudWatchUtil).to receive(:put_metric_data)

        expect(subject).to eq(2)

        expect(run1.reload.status).to eq(WorkflowRun::STATUS[:running])
        expect(run2.reload.status).to eq(WorkflowRun::STATUS[:succeeded])
        expect(run3.reload.status).to eq(WorkflowRun::STATUS[:failed])
        expect(run4.reload.status).to eq(WorkflowRun::STATUS[:failed])
      end

      it "marks overdue pipeline runs as failed" do
        _ = [run5, run6, run7]

        expect(CloudWatchUtil).to receive(:put_metric_data)

        expect(subject).to eq(1)

        expect(run5.reload.job_status).to eq(PipelineRun::STATUS_RUNNING)
        expect(run6.reload.job_status).to eq(PipelineRun::STATUS_CHECKED)
        expect(run7.reload.job_status).to eq(PipelineRun::STATUS_RUNNING)
      end
    end
  end
end
