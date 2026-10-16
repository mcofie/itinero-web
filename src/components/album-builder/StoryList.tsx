"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import type { AlbumPhoto } from "./album-draft";
import styles from "./AlbumBuilder.module.css";

type StoryListProps = {
    photos: AlbumPhoto[];
    onReorder: (fromId: string, toId: string) => void;
    onMove: (index: number, delta: number) => void;
    onCaption: (id: string, caption: string) => void;
    onSelect: (id: string) => void;
};

/** Photo order and captions. Rows drag by their handle; arrow buttons and the keyboard also move them. */
export default function StoryList({ photos, onReorder, onMove, onCaption, onSelect }: StoryListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (over && active.id !== over.id) onReorder(String(active.id), String(over.id));
    };
    return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={photos.map(photo => photo.id)} strategy={verticalListSortingStrategy}>
            <div className={styles.storyList}>
                {photos.map((photo, index) => <StoryRow key={photo.id} photo={photo} index={index} count={photos.length} onMove={onMove} onCaption={onCaption} onSelect={onSelect} />)}
            </div>
        </SortableContext>
    </DndContext>;
}

function StoryRow({ photo, index, count, onMove, onCaption, onSelect }: { photo: AlbumPhoto; index: number; count: number } & Pick<StoryListProps, "onMove" | "onCaption" | "onSelect">) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
    return <div ref={setNodeRef} className={`${styles.storyRow} ${isDragging ? styles.storyRowDragging : ""}`} style={{ transform: CSS.Transform.toString(transform), transition }}>
        <button ref={setActivatorNodeRef} type="button" className={styles.dragHandle} aria-label={`Drag to reorder photo ${index + 1}`} {...attributes} {...listeners}><GripVertical size={17} /></button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="" loading="lazy" onClick={() => onSelect(photo.id)} />
        <div className={styles.storyFields}>
            <span>Moment {String(index + 1).padStart(2, "0")}</span>
            <input value={photo.caption} onFocus={() => onSelect(photo.id)} onChange={event => onCaption(photo.id, event.target.value)} maxLength={90} placeholder="The story behind this photo…" aria-label={`Caption for photo ${index + 1}`} />
        </div>
        <div className={styles.moveButtons}>
            <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={`Move photo ${index + 1} earlier`}><ArrowUp size={16} /></button>
            <button type="button" onClick={() => onMove(index, 1)} disabled={index === count - 1} aria-label={`Move photo ${index + 1} later`}><ArrowDown size={16} /></button>
        </div>
    </div>;
}
