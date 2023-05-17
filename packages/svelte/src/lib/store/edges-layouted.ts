import { derived } from 'svelte/store';
import { Position } from '@reactflow/system';
import { getHandle } from '@reactflow/edge-utils';

import { getEdgePositions, getNodeData } from '$lib/container/EdgeRenderer/utils';
import type { EdgeLayouted } from '$lib/types';
import type { SvelteFlowStoreState } from './types';

export function getEdgesLayouted(store: SvelteFlowStoreState) {
  return derived([store.edges, store.nodes], ([edges, nodes]) => {
    return edges.reduce<EdgeLayouted[]>((res, edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);
      const [sourceNodeRect, sourceHandleBounds, sourceIsValid] = getNodeData(sourceNode);
      const [targetNodeRect, targetHandleBounds, targetIsValid] = getNodeData(targetNode);

      if (!sourceIsValid || !targetIsValid) {
        return res;
      }

      const edgeType = edge.type || 'default';

      const targetNodeHandles = targetHandleBounds!.target;
      const sourceHandle = getHandle(sourceHandleBounds!.source!, edge.sourceHandle);
      const targetHandle = getHandle(targetNodeHandles!, edge.targetHandle);
      const sourcePosition = sourceHandle?.position || Position.Bottom;
      const targetPosition = targetHandle?.position || Position.Top;

      if (!sourceHandle || !targetHandle) {
        return res;
      }

      const { sourceX, sourceY, targetX, targetY } = getEdgePositions(
        sourceNodeRect,
        sourceHandle,
        sourcePosition,
        targetNodeRect,
        targetHandle,
        targetPosition
      );

      // we nee to do this to match the types
      const sourceHandleId = edge.sourceHandle;
      const targetHandleId = edge.targetHandle;

      res.push({
        ...edge,
        selectable: edge.selectable || typeof edge.selectable === 'undefined',
        type: edgeType,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        sourceHandleId,
        targetHandleId
      } as EdgeLayouted);

      return res;
    }, []);
  });
}