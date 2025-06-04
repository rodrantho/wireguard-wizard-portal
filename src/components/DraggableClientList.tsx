
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Cliente } from '@/lib/supabase';
import { UserClientOrder } from '@/lib/userPreferences';
import ClientCard from './ClientCard';

interface SortableClientCardProps {
  cliente: Cliente & { peerCount?: number };
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onAddPeer: (id: string) => void;
  onShowComments?: (id: string, name: string) => void;
  userOrder?: UserClientOrder;
  onToggleFavorite?: (clienteId: string) => void;
  tags?: any[];
}

function SortableClientCard(props: SortableClientCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.cliente.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ClientCard
        {...props}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
}

interface DraggableClientListProps {
  clientes: (Cliente & { peerCount?: number })[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onAddPeer: (id: string) => void;
  onShowComments?: (id: string, name: string) => void;
  onToggleFavorite?: (clienteId: string) => void;
  onReorder: (clientes: Cliente[]) => void;
  clientOrders: UserClientOrder[];
  tags?: any[];
  viewMode: 'expanded' | 'grid';
}

export default function DraggableClientList({
  clientes,
  onEdit,
  onDelete,
  onView,
  onAddPeer,
  onShowComments,
  onToggleFavorite,
  onReorder,
  clientOrders,
  tags = [],
  viewMode
}: DraggableClientListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = clientes.findIndex((cliente) => cliente.id === active.id);
      const newIndex = clientes.findIndex((cliente) => cliente.id === over?.id);

      const reorderedClientes = arrayMove(clientes, oldIndex, newIndex);
      onReorder(reorderedClientes);
    }
  }

  const gridClass = viewMode === 'grid' 
    ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid gap-6';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={clientes.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className={gridClass}>
          {clientes.map((cliente) => {
            const clientOrder = clientOrders.find(order => order.cliente_id === cliente.id);
            const clientTags = tags.filter((tag: any) => tag.cliente_id === cliente.id);
            
            return (
              <SortableClientCard
                key={cliente.id}
                cliente={cliente}
                userOrder={clientOrder}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                onAddPeer={onAddPeer}
                onShowComments={onShowComments}
                onToggleFavorite={onToggleFavorite}
                tags={clientTags}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
