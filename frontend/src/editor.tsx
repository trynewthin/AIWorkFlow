import { FixedLayoutEditorProvider, EditorRenderer } from '@flowgram.ai/fixed-layout-editor';

import '@flowgram.ai/fixed-layout-editor/index.css';
import './index.css';

import { nodeRegistries } from './node-registries';
import { initialData } from './initial-data';
import { useEditorProps } from './hooks/use-editor-props';
import { Tools } from './components/tools';
import { Minimap } from './components/minimap';

export const Editor = () => {
  const editorProps = useEditorProps(initialData, nodeRegistries);
  return (
    <FixedLayoutEditorProvider {...editorProps}>
      <div className="demo-fixed-container bg-gray-100 p-4">
        <div className="mb-4 text-blue-600 font-bold text-xl">AIWorkFlow 工作流编辑器</div>
        <EditorRenderer>{/* add child panel here */}</EditorRenderer>
      </div>
      <Tools />
      <Minimap />
    </FixedLayoutEditorProvider>
  );
};
