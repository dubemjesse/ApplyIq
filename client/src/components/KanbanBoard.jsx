import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const COLUMNS = [
  { status: "SAVED", label: "Saved" },
  { status: "APPLIED", label: "Applied" },
  { status: "INTERVIEW", label: "Interview" },
  { status: "OFFER", label: "Offer" },
  { status: "REJECTED", label: "Rejected" },
];

export default function KanbanBoard({ applications = [], onStatusChange, onSelect, selectedId }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    if (newStatus === result.source.droppableId) return;
    onStatusChange(result.draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {COLUMNS.map((column) => {
          const cards = applications.filter((a) => a.status === column.status);
          return (
            <div key={column.status} className="rounded-lg border border-white/10 bg-navy-light/30 p-3">
              <h4 className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                {column.label}
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                  {cards.length}
                </span>
              </h4>
              <Droppable droppableId={column.status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex min-h-[60px] flex-col gap-2 rounded-md transition-colors ${
                      snapshot.isDraggingOver ? "bg-electric/5" : ""
                    }`}
                  >
                    {cards.map((application, index) => (
                      <Draggable key={application.id} draggableId={application.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            onClick={() => onSelect(application)}
                            className={`cursor-pointer rounded-md bg-navy-lighter/60 p-3 text-sm text-slate-200 hover:bg-navy-lighter transition-colors ${
                              dragSnapshot.isDragging ? "ring-2 ring-electric" : ""
                            } ${selectedId === application.id ? "ring-1 ring-lime" : ""}`}
                          >
                            <p className="font-medium text-white">{application.job?.title ?? "Untitled role"}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{application.job?.company}</p>
                            {application.matchScore != null && (
                              <p className="mt-1 text-xs text-lime">{application.matchScore}% match</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
