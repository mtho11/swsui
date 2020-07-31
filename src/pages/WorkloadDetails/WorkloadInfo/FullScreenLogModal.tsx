import * as React from 'react';
import ReactModal from 'react-modal';
import { style } from 'typestyle';
import { Toolbar, ToolbarGroup, ToolbarItem, Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { KialiIcon, defaultIconStyle } from 'config/KialiIcon';

type FullScreenLogProps = {
  logText?: string;
  title: string;
  ref: React.RefObject<any>;
};

type FullScreenLogState = {
  show: boolean;
};

// const customStyles = {
//   content : {
//     top                   : '50%',
//     left                  : '50%',
//     right                 : 'auto',
//     bottom                : 'auto',
//     // marginRight           : '-50%',
//     //transform             : 'translate(-50%, -50%)'
//   }
// };

// const modalStyle = style({
//   width: '100',
//   height: '100%'
// });

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
    this.state = { show: false };
  }

  open = () => {
    this.setState({ show: true });
  };

  close = () => {
    this.setState({ show: false });
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
            <Tooltip key="collapse_fs" position="top" content="Collapse full screen">
              <Button variant={ButtonVariant.link} onClick={this.close} isInline>
                <KialiIcon.Compress className={defaultIconStyle} />
              </Button>
            </Tooltip>
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
  };

  render() {
    if (!this.state.show || !this.props.logText) {
      return null;
    }

    return (
      <ReactModal
        isOpen={this.state.show}
        onAfterOpen={this.afterOpenModal()}
        parentSelector={() => document.body}
        // style={customStyles}
        style={{
          // overlay: {
          //   position: 'fixed',
          //   top: 0,
          //   left: 0,
          //   right: 0,
          //   bottom: 0,
          //   backgroundColor: 'rgba(255, 255, 255, 0.75)'
          // },
          content: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: '0px',
            left: '5px',
            right: '5px',
            bottom: '10px',
            border: '1px solid #ccc',
            zIndex: -200,
            // background: 'green',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px'
          }
        }}
        ariaHideApp={false}
      >
        {this.renderToolbar()}
        <textarea ref={this.textareaRef} value={this.props.logText} className={textAreaStyle} readOnly={true} />
      </ReactModal>
    );
  }
}
