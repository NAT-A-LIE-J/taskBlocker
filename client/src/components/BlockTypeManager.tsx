import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Edit, Trash2 } from 'lucide-react';
import { type BlockType } from '@shared/schema';
import { BlockTypeDialog } from './BlockTypeDialog';

interface BlockTypeManagerProps {
  blockTypes: BlockType[];
  onCreateBlockType: (data: { name: string; color: string }) => void;
  onUpdateBlockType: (id: string, data: { name: string; color: string }) => void;
  onDeleteBlockType: (id: string) => void;
}

export function BlockTypeManager({ 
  blockTypes, 
  onCreateBlockType, 
  onUpdateBlockType, 
  onDeleteBlockType 
}: BlockTypeManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlockType, setEditingBlockType] = useState<BlockType | undefined>();
  const [showManager, setShowManager] = useState(false);

  const handleCreateNew = () => {
    setEditingBlockType(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (blockType: BlockType) => {
    setEditingBlockType(blockType);
    setIsDialogOpen(true);
  };

  const handleDelete = (blockType: BlockType) => {
    if (confirm(`Are you sure you want to delete "${blockType.name}"? This will not affect existing time blocks.`)) {
      onDeleteBlockType(blockType.id);
    }
  };

  const handleSave = (data: { name: string; color: string }) => {
    if (editingBlockType) {
      onUpdateBlockType(editingBlockType.id, data);
    } else {
      onCreateBlockType(data);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Block Types</h3>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateNew}
              className="h-7 px-2 text-xs"
              data-testid="button-add-block-type"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManager(!showManager)}
              className="h-7 px-2 text-xs"
              data-testid="button-manage-block-types"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Block Types List */}
        <div className="space-y-2">
          {blockTypes.map((blockType) => (
            <div
              key={blockType.id}
              className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              data-testid={`block-type-${blockType.id}`}
            >
              <div className="flex items-center space-x-2 flex-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: blockType.color }}
                />
                <span className="text-sm font-medium">{blockType.name}</span>
              </div>
              
              {showManager && (
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(blockType)}
                    className="h-6 w-6 p-0"
                    data-testid={`button-edit-${blockType.id}`}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(blockType)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    data-testid={`button-delete-${blockType.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {blockTypes.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No block types yet.{' '}
            <button
              onClick={handleCreateNew}
              className="text-blue-500 hover:text-blue-700 underline"
              data-testid="link-create-first-block-type"
            >
              Create your first one
            </button>
          </div>
        )}
      </div>

      <BlockTypeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        blockType={editingBlockType}
      />
    </>
  );
}