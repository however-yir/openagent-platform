import { WorkbenchPage } from "#/components/features/forgepilot/workbench-page";
import { workbenchPages } from "#/components/features/forgepilot/workbench-data";

export default function Orchestration() {
  return <WorkbenchPage config={workbenchPages.orchestration} />;
}
