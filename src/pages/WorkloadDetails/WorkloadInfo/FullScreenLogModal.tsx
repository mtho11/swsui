import * as React from 'react';
import Popup from 'reactjs-popup';
import { style } from 'typestyle';
import { Toolbar, ToolbarGroup, ToolbarItem, Button, ButtonVariant } from '@patternfly/react-core';
import { KialiIcon, defaultIconStyle } from 'config/KialiIcon';

type FullScreenLogProps = {
  logText?: string;
  title: string;
  ref: React.RefObject<any>;
  // trigger: JSX.Element | ((isOpen: boolean) => JSX.Element);
};

type FullScreenLogState = {
  open: boolean;
};

const modalStyle = style({
  width: '100%',
  height: '100%'
});

const textAreaStyle = style({
  width: '100%',
  height: '93%',
  marginTop: '10px',
  overflow: 'auto',
  resize: 'none',
  color: '#fff',
  fontFamily: 'monospace',
  fontSize: '11pt',
  padding: '10px',
  whiteSpace: 'pre',
  backgroundColor: '#003145'
});

export class FullScreenLogModal extends React.PureComponent<FullScreenLogProps, FullScreenLogState> {
  private readonly textareaRef;

  constructor(props: FullScreenLogProps) {
    super(props);
    this.textareaRef = React.createRef();
    this.state = { open: false };
  }

  open = () => {
    this.setState({ open: true });
  };

  close = () => {
    this.setState({ open: false });
  };

  afterOpenModal = () => {
    console.log('Opening Modal!');
  };

  renderToolbar = () => {
    return (
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem>
            <h2>{this.props.title}</h2>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup style={{ marginLeft: 'auto' }}>
          <ToolbarItem>
            <Button variant={ButtonVariant.link} onClick={this.close} isInline>
              <KialiIcon.Compress className={defaultIconStyle} />
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
  };

  render() {
    // if (!this.state.open || !this.props.logText) {
    //   console.warn("Is Null");
    //   return null;
    // }

    return (
      <Popup
        open={this.state.open}
        onClose={this.close}
        className={modalStyle}
        closeOnEscape={true}
        closeOnDocumentClick={false}
        arrow={false}
        position="center center"
        modal
        trigger={open => (
          <Button variant={ButtonVariant.link} isInline>
            {open} <KialiIcon.Expand className={defaultIconStyle} />
          </Button>
        )}
        // trigger={
        //   // <Tooltip key="expand_app_logs" position="top" content="Expand App logs full screen">
        //   <Button variant={ButtonVariant.link} isInline>
        //     <KialiIcon.Expand className={defaultIconStyle} />
        //   </Button>
        //   // </Tooltip>
        // }
      >
        <>
          {this.renderToolbar()}
          <textarea ref={this.textareaRef} value={this.props.logText} className={textAreaStyle} readOnly={true} />
        </>
      </Popup>
    );
  }
}
