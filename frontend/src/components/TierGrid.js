import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TierGrid = ({ tiers, items, onItemMove, readOnly = false }) => {
  const [tierItems, setTierItems] = useState({});

  // Initialize tier items
  useEffect(() => {
    const initialTierItems = {};
    
    // Initialize empty arrays for each tier
    tiers.forEach(tier => {
      initialTierItems[tier.tierId] = [];
    });
    
    // Populate tiers with items
    if (items && items.length > 0) {
      items.forEach(item => {
        if (item.tier && item.tier.tierId) {
          if (!initialTierItems[item.tier.tierId]) {
            initialTierItems[item.tier.tierId] = [];
          }
          initialTierItems[item.tier.tierId].push(item);
        }
      });
    }
    
    setTierItems(initialTierItems);
  }, [tiers, items]);

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination || readOnly) return;
    
    const { source, destination, draggableId } = result;
    
    // If dropped in the same tier at the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Get source and destination tier IDs
    const sourceTierId = parseInt(source.droppableId);
    const destTierId = parseInt(destination.droppableId);
    
    // Get the item being moved
    const itemId = parseInt(draggableId);
    const item = items.find(i => i.itemId === itemId);
    
    // Create new tier items state
    const newTierItems = { ...tierItems };
    
    // Remove from source tier
    newTierItems[sourceTierId] = newTierItems[sourceTierId].filter(
      i => i.itemId !== itemId
    );
    
    // Add to destination tier
    const updatedItem = { ...item, tier: tiers.find(t => t.tierId === destTierId) };
    newTierItems[destTierId] = [
      ...newTierItems[destTierId].slice(0, destination.index),
      updatedItem,
      ...newTierItems[destTierId].slice(destination.index)
    ];
    
    // Update state
    setTierItems(newTierItems);
    
    // Call callback with updated item
    if (onItemMove) {
      onItemMove(itemId, destTierId, destination.index);
    }
  };

  // Get tier color class
  const getTierColorClass = (tierName) => {
    const name = tierName.toLowerCase();
    if (name === 's') return 'tier-s';
    if (name === 'a') return 'tier-a';
    if (name === 'b') return 'tier-b';
    if (name === 'c') return 'tier-c';
    if (name === 'd') return 'tier-d';
    if (name === 'f') return 'tier-f';
    return '';
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="tier-grid">
        {tiers.sort((a, b) => a.rankOrder - b.rankOrder).map(tier => (
          <div key={tier.tierId} className={`tier-row ${getTierColorClass(tier.name)}`}>
            <div className="tier-label">{tier.name}</div>
            <Droppable droppableId={tier.tierId.toString()} direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`tier-items ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  {tierItems[tier.tierId] && tierItems[tier.tierId].map((item, index) => (
                    <Draggable
                      key={item.itemId}
                      draggableId={item.itemId.toString()}
                      index={index}
                      isDragDisabled={readOnly}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`tier-item ${snapshot.isDragging ? 'dragging' : ''}`}
                        >
                          <div className="item-content">
                            <div className="item-name">{item.originalItem.name}</div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TierGrid; 