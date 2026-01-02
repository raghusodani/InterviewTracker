import KanbanCard from "./KanbanCard";
import type { Column } from "../../types/column.types";
import type { Interview } from "../../types/interview.types";

interface KanbanColumnProps {
  column: Column;
  interviews: Interview[];
}

const KanbanColumn = ({ column, interviews }: KanbanColumnProps) => {
  return (
    <div className="flex flex-col bg-gray-100 rounded-lg p-4 w-80">
      <h2 className="text-md font-semibold text-gray-800 mb-4">
        {column.name}
        <span className="ml-2 text-sm text-gray-500">
          ({interviews.length})
        </span>
      </h2>

      <div className="flex flex-col gap-4">
        {interviews.map((interview) => (
          <KanbanCard
            key={`${interview.companyName}-${interview.lastUpdatedDate}`}
            interview={interview}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
