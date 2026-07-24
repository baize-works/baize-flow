import type { ComponentType } from 'react'
import SourceNode from './source/node'
import TransformNode from './transform/node'
import SinkNode from './sink/node'
export enum BlockEnum {
  Source = 'source',
  Sink = 'sink',
  Transform = 'transform',
}

export const NodeComponentMap: Record<string, ComponentType<any>> = {
  [BlockEnum.Source]: SourceNode,
  [BlockEnum.Transform]: TransformNode,
  [BlockEnum.Sink]: SinkNode,
}

export const CUSTOM_NODE_TYPE = 'custom'
