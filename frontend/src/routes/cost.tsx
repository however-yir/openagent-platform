import { WorkbenchPage } from "#/components/features/forgepilot/workbench-page";
import { workbenchPages } from "#/components/features/forgepilot/workbench-data";

export default function Cost() {
  return <WorkbenchPage config={workbenchPages.cost} />;
}
