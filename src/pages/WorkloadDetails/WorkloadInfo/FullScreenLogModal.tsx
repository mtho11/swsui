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

  close = () => {
    this.setState({ open: false });
  };

  afterOpenModal = () => {
    console.log('Opening Modal!');
    this.setState({ open: true });
    // this.textareaRef.current.scrollTop = this.textareaRef.current.scrollHeight;
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
        onOpen={this.afterOpenModal}
        className={modalStyle}
        closeOnEscape={true}
        closeOnDocumentClick={false}
        arrow={false}
        position="center center"
        contentStyle={{ width: '100%', height: '100%', zIndex: 500 }}
        modal
        trigger={() => (
          <Button variant={ButtonVariant.link} isInline>
            <KialiIcon.Expand className={defaultIconStyle} />
          </Button>
        )}
      >
        {(close, _isOpen) => (
          <>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarItem>
                  <h2 style={{ fontWeight: 'bold' }}>Logs for: {this.props.title}</h2>
                </ToolbarItem>
              </ToolbarGroup>
              <ToolbarGroup style={{ marginLeft: 'auto' }}>
                <ToolbarItem>
                  <Button variant={ButtonVariant.link} onClick={close} isInline>
                    <KialiIcon.Compress className={defaultIconStyle} />
                  </Button>
                </ToolbarItem>
              </ToolbarGroup>
            </Toolbar>

            <textarea ref={this.textareaRef} value={this.props.logText} className={textAreaStyle} readOnly={true} />
          </>
        )}
      </Popup>
    );
  }
}
