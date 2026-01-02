import { useEffect, useState } from "react";
import KanbanColumn from "./KanbanColumn";
import { getColumns } from "../../services/column.service";
import { getInterviews } from "../../services/interview.service";
import type { Column } from "../../types/column.types";
import type { Interview } from "../../types/interview.types";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [columnsData, interviewsData] = await Promise.all([
        getColumns(),
        getInterviews(),
      ]);

      setColumns(columnsData.sort((a, b) => a.order - b.order));
      setInterviews(interviewsData);
    };

    fetchData();
  }, []);

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnInterviews = interviews.filter(
          (interview) => interview.currentStatus === column.id
        );

        return (
          <KanbanColumn
            key={column.id}
            column={column}
            interviews={columnInterviews}
          />
        );
      })}
    </div>
  );
};

export default KanbanBoard;
