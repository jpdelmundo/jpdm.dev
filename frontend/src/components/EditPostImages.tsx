import { getImageFileDetail } from "@/utils/helper";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import Cancel from '@mui/icons-material/Cancel';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import type PostImageExtended from "@shared/models/extensions/PostImageExtended";
import type { PostImageDraft } from "@shared/types/PostImageDraft";
import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import { CoverImage } from "./CoverImage";

type PostImage = PostImageDraft | PostImageExtended;

type EditPostImagesDialogProps = {
    open: boolean;
    images: PostImage[];
    onChange?: (images: PostImage[]) => void;
    closeDialog: () => void;
}

export function EditPostImagesDialog({ images, onChange, open, closeDialog }: EditPostImagesDialogProps) {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [postImages, setPostImages] = useState<PostImage[]>(images);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setPostImages((items) => {
            const oldIndex = items.findIndex(v => v.id === active.id);
            const newIndex = items.findIndex(v => v.id === over.id);

            const ordered = arrayMove(items, oldIndex, newIndex);
            return ordered;
        });
    }

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newFiles: PostImageDraft[] = [];
        let sort = postImages.length;
        for (const file of files) {
            const imageDetail = await getImageFileDetail(file);
            newFiles.push({
                id: Math.random().toString(36).slice(2),
                file_id: null,
                file,
                url: URL.createObjectURL(file),
                width: imageDetail.width,
                height: imageDetail.height,
                upload_status: 'pending',
                sort: sort++
            });
        }

        setPostImages(prev => {
            return ([
                ...prev,
                ...newFiles
            ]);
        });

        e.target.value = '';
    }

    const doneOnClick = () => {
        onChange?.(postImages);
        closeDialog();
    };

    const dialogOnClose = () => {
        closeDialog();
    }

    const onRemove = (image: PostImage) => {
        setPostImages(prev => prev.filter(v => v.id !== image.id));
    }

    useEffect(() => {
        setPostImages(images);
    }, [images, open]);

    return (
        <Dialog
            open={open}
            onClose={dialogOnClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                    sx: {
                        minHeight: '50vh',
                        maxHeight: '90vh'
                    }
                }
            }}
        >
            <DialogTitle textAlign="center">Edit images</DialogTitle>
            <DialogContent>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={postImages}
                        strategy={rectSortingStrategy}
                    >
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '5px'
                        }}>
                            {postImages.map(image => <SortableItem key={image.id} image={image} onRemove={onRemove} />)}
                        </Box>
                    </SortableContext>
                </DndContext>
            </DialogContent>
            <DialogActions sx={{ p: '15px' }}>
                <Stack flex={1} gap={1}>
                    <Box display="flex" justifyContent="flex-end">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            ref={inputFileRef}
                            style={{ display: 'none' }}
                        />
                        <IconButton
                            color="primary"
                            onClick={() => inputFileRef.current?.click()}
                            disableRipple
                            sx={{ py: 0 }}>
                            <AddPhotoAlternate fontSize="large" />
                        </IconButton>
                    </Box>
                    <Stack gap={1}>
                        <Button
                            type="submit"
                            form="image-upload-form"
                            variant="contained"
                            onClick={doneOnClick}
                        >Done</Button>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}

function SortableItem({ image, onRemove }: { image: PostImage, onRemove: (image: PostImage) => void }) {
    const { id } = image;
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : ''
    };

    const removeOnClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(image);
    }

    return <Box
        ref={setNodeRef}
        style={style}
        sx={{
            aspectRatio: 1.618,
            display: 'flex',
            borderRadius: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            '&:hover .remove': {
                opacity: 0.5
            }
        }}
    >
        <IconButton
            className="remove"
            onClick={removeOnClick}
            sx={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                padding: 0,
                opacity: 0,
                bgcolor: '#00000000',
                '&:hover': {
                    opacity: '1 !important'
                }
            }}>
            <Cancel sx={{ width: '30px', height: '30px', color: '#ffffff' }} />
        </IconButton>
        <Box
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            sx={{ width: '100%', height: '100%' }}
        >
            <CoverImage image={image} sx={{ cursor: 'grab' }} />
        </Box>
    </Box>
}