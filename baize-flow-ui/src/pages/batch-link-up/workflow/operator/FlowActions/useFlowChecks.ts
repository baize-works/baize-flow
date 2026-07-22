import { classifyCheckResult, generateCheckList, groupCheckListByNode } from "../flowCheckEngine";



export function useFlowChecks(nodes: any[]) {
const checkList = generateCheckList(nodes);
const checkStat = classifyCheckResult(checkList);
const checkGroups = groupCheckListByNode(checkList);


return { checkList, checkStat, checkGroups };
}