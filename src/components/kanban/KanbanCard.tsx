import type { Interview } from "../../types/interview.types";

interface KanbanCardProps {
  interview: Interview;
}

const KanbanCard = ({ interview }: KanbanCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-2">
      <h3 className="text-lg font-semibold text-gray-800">
        {interview.companyName}
      </h3>

      <p className="text-sm text-gray-600">
        <span className="font-medium">Last Updated:</span>{" "}
        {interview.lastUpdatedDate}
      </p>

      <p className="text-sm text-gray-700">
        <span className="font-medium">Next Steps:</span>{" "}
        {interview.nextSteps}
      </p>
    </div>
  );
};

export default KanbanCard;
