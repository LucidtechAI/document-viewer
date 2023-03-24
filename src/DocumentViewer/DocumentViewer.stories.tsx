/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import DocumentViewer, { DocumentViewerProps } from '.';

export default {
  title: 'DocumentViewer',
  component: DocumentViewer,
} as Meta;

const Template: Story<DocumentViewerProps> = (args) => <DocumentViewer {...args} />;

export const Empty = Template.bind({});
Empty.args = {};

export const Loading = Template.bind({});
Loading.args = { loading: true };

export const MultiPagePDF = (): JSX.Element => (
  <DocumentViewer doc={null} documentType="application/pdf" showPageCount />
);

export const RotatePDF = (): JSX.Element => {
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  return (
    <div>
      <div>rotation: {rotation}</div>
      <DocumentViewer
        doc={null}
        documentType="application/pdf"
        onRotate={(rotation) => setRotation(rotation)}
      />
    </div>
  );
};

export const MultiPageTIFF = (): JSX.Element => (
  <DocumentViewer doc={null} documentType="image/tiff" />
);

export const SimpleImage = (): JSX.Element => (
  <DocumentViewer url={'https://placehold.co/1200x1600/png'} documentType="image/png" />
);

export const WideBigPNG = (): JSX.Element => (
  <DocumentViewer doc={null} documentType="image/png" />
);
