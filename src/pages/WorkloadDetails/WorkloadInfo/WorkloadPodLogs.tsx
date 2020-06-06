import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Grid,
  GridItem,
  Switch,
  TextInput,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Tooltip
} from '@patternfly/react-core';
import { style } from 'typestyle';
import { Logs, Pod, PodLogs } from '../../../types/IstioObjects';
import { getPodLogs, Response } from '../../../services/Api';
import { CancelablePromise, makeCancelablePromise } from '../../../utils/CancelablePromises';
import { ToolbarDropdown } from '../../../components/ToolbarDropdown/ToolbarDropdown';
import { DurationInSeconds, TimeRange } from '../../../types/Common';
import { RenderComponentScroll } from '../../../components/Nav/Page';
import { retrieveDuration } from 'components/Time/TimeRangeHelper';
import TimeRangeComponent from 'components/Time/TimeRangeComponent';
import Splitter from 'm-react-splitters';
import RefreshContainer from '../../../components/Refresh/Refresh';
import { KialiIcon } from '../../../config/KialiIcon';

export interface WorkloadPodLogsProps {
  namespace: string;
  pods: Pod[];
}

interface ContainerInfo {
  container: string;
  containerOptions: string[];
}

interface WorkloadPodLogsState {
  containerInfo?: ContainerInfo;
  duration: DurationInSeconds;
  loadingAppLogs: boolean;
  loadingProxyLogs: boolean;
  loadingAppLogsError?: string;
  loadingProxyLogsError?: string;
  podValue?: number;
  appLogs?: PodLogs;
  proxyLogs?: PodLogs;
  hideFilteredAppLogs?: Logs;
  hideFilteredProxyLogs?: Logs;
  filteredAppLogs?: Logs;
  filteredProxyLogs?: Logs;
  tailLines: number;
  isLogWindowSelectExpanded: boolean;
  logWindowSelections: any[];
  sideBySideOrientation: boolean;
  hideLogValue: string;
  showLogValue: string;
  showClearHideLogButton: boolean;
  showClearShowLogButton: boolean;
  splitPercent: string;
  useRegex: boolean;
}

const RETURN_KEY_CODE = 13;
const NoAppLogsFoundMessage = 'No logs found for the time period.';
const NoProxyLogsFoundMessage =
  'Failed to fetch container logs: container istio-proxy is not valid for pod two-containers';

const TailLinesDefault = 500;
const TailLinesOptions = {
  '-1': 'All lines',
  '10': 'Last 10 lines',
  '50': 'Last 50 lines',
  '100': 'Last 100 lines',
  '300': 'Last 300 lines',
  '500': 'Last 500 lines',
  '1000': 'Last 1000 lines',
  '5000': 'Last 5000 lines'
};

const appLogsDivVertical = style({
  height: 'calc(100% + 30px)'
});
const appLogsDivHorizontal = style({
  height: '100%',
  marginRight: '5px'
});

const proxyLogsDiv = style({
  height: '100%'
});

const logsTitle = style({
  margin: '15px 0 0 10px'
});

const infoIcons = style({
  marginLeft: '0.5em',
  width: '24px'
});

const logTextAreaBackground = (enabled = true) => ({ backgroundColor: enabled ? '#003145' : 'gray' });

const logsTextarea = (enabled = true) =>
  style(logTextAreaBackground(enabled), {
    width: 'calc(100% - 15px)',
    height: 'calc(100% - 85px)',
    overflow: 'auto',
    resize: 'none',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '11pt',
    padding: '10px',
    whiteSpace: 'pre',
    margin: '0 10px 0 10px'
  });

const toolbarRight = style({
  right: '50px',
  position: 'absolute'
});

const displayFlex = style({
  display: 'flex'
});

const toolbarMargin = style({
  margin: '10px'
});

const tailToolbarMargin = style({
  marginTop: '2px'
});

export default class WorkloadPodLogs extends React.Component<WorkloadPodLogsProps, WorkloadPodLogsState> {
  private loadPodLogsPromise?: CancelablePromise<Response<PodLogs>[]>;
  private loadContainerLogsPromise?: CancelablePromise<Response<PodLogs>[]>;
  private readonly appLogsRef: any;
  private readonly proxyLogsRef: any;
  private podOptions: string[] = [];

  constructor(props: WorkloadPodLogsProps) {
    super(props);
    this.appLogsRef = React.createRef();
    this.proxyLogsRef = React.createRef();

    if (this.props.pods.length < 1) {
      this.state = {
        duration: retrieveDuration() || 600,
        loadingAppLogs: false,
        loadingProxyLogs: false,
        loadingAppLogsError: 'There are no logs to display because no pods are available.',
        loadingProxyLogsError: 'There are no logs to display because no container logs are available.',
        tailLines: TailLinesDefault,
        isLogWindowSelectExpanded: false,
        logWindowSelections: [],
        sideBySideOrientation: false,
        hideLogValue: '',
        showLogValue: '',
        showClearHideLogButton: false,
        showClearShowLogButton: false,
        splitPercent: '50%',
        useRegex: false
      };
      return;
    }

    if (this.props.pods.length > 0) {
      for (let i = 0; i < this.props.pods.length; ++i) {
        this.podOptions[`${i}`] = this.props.pods[i].name;
      }
    }

    const podValue = 0;
    const pod = this.props.pods[podValue];
    const containerInfo = this.getContainerInfo(pod);

    this.state = {
      containerInfo: containerInfo,
      duration: retrieveDuration() || 600,
      loadingAppLogs: false,
      loadingProxyLogs: false,
      podValue: podValue,
      tailLines: TailLinesDefault,
      isLogWindowSelectExpanded: false,
      logWindowSelections: [],
      sideBySideOrientation: false,
      hideLogValue: '',
      showLogValue: '',
      showClearHideLogButton: false,
      showClearShowLogButton: false,
      splitPercent: '50%',
      useRegex: false
    };
  }

  componentDidMount() {
    if (this.state.containerInfo) {
      const pod = this.props.pods[this.state.podValue!];
      this.fetchLogs(
        this.props.namespace,
        pod.name,
        this.state.containerInfo.container,
        this.state.tailLines,
        this.state.duration
      );
    }
  }

  componentDidUpdate(_prevProps: WorkloadPodLogsProps, prevState: WorkloadPodLogsState) {
    const prevContainer = prevState.containerInfo ? prevState.containerInfo.container : undefined;
    const newContainer = this.state.containerInfo ? this.state.containerInfo.container : undefined;
    const updateContainerInfo = this.state.containerInfo && this.state.containerInfo !== prevState.containerInfo;
    const updateContainer = newContainer && newContainer !== prevContainer;
    const updateDuration = this.state.duration && prevState.duration !== this.state.duration;
    const updateTailLines = this.state.tailLines && prevState.tailLines !== this.state.tailLines;
    if (updateContainerInfo || updateContainer || updateDuration || updateTailLines) {
      const pod = this.props.pods[this.state.podValue!];
      this.fetchLogs(this.props.namespace, pod.name, newContainer!, this.state.tailLines, this.state.duration);
    }
    this.proxyLogsRef.current.scrollTop = this.proxyLogsRef.current.scrollHeight;
    this.appLogsRef.current.scrollTop = this.appLogsRef.current.scrollHeight;
  }

  renderItem = object => {
    return <ToolbarItem className={displayFlex}>{object}</ToolbarItem>;
  };

  render() {
    const { sideBySideOrientation } = this.state;
    return (
      <RenderComponentScroll>
        {this.state.containerInfo && (
          <Grid style={{ padding: '10px', height: '100%' }}>
            <GridItem span={12}>
              <Card style={{ height: '100%' }}>
                <CardBody>
                  <Toolbar className={toolbarMargin}>
                    <ToolbarGroup>
                      <ToolbarItem className={displayFlex}>
                        <ToolbarDropdown
                          id={'wpl_pods'}
                          nameDropdown="Pod"
                          tooltip="Display logs for the selected pod"
                          handleSelect={key => this.setPod(key)}
                          value={this.state.podValue}
                          label={this.props.pods[this.state.podValue!].name}
                          options={this.podOptions!}
                        />
                      </ToolbarItem>
                      <ToolbarItem className={displayFlex} style={{ marginLeft: '1em' }}>
                        <ToolbarDropdown
                          id={'wpl_containers'}
                          nameDropdown="Container"
                          tooltip="Choose container for selected pod"
                          handleSelect={key => this.setContainer(key)}
                          value={this.state.containerInfo.container}
                          label={this.state.containerInfo.container}
                          options={this.state.containerInfo.containerOptions!}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>

                    <ToolbarGroup className={toolbarRight}>
                      <ToolbarItem className={displayFlex}>
                        <ToolbarDropdown
                          id={'wpl_tailLines'}
                          handleSelect={key => this.setTailLines(Number(key))}
                          value={this.state.tailLines}
                          label={TailLinesOptions[this.state.tailLines]}
                          options={TailLinesOptions}
                          tooltip={'Show up to last N log lines'}
                          classNameSelect={tailToolbarMargin}
                        />
                      </ToolbarItem>
                      <ToolbarItem>
                        <TimeRangeComponent
                          tooltip="Time range for log messages"
                          onChanged={this.setTimeRange}
                          allowCustom={false}
                        />
                      </ToolbarItem>
                      <ToolbarItem>
                        <RefreshContainer
                          id="workload_logging_refresh"
                          hideLabel={true}
                          disabled={!this.state.appLogs}
                          handleRefresh={this.handleRefresh}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                  </Toolbar>
                  <Toolbar className={toolbarMargin}>
                    <ToolbarGroup>
                      <ToolbarItem>
                        <Switch
                          id="orientation-switch"
                          label="Side by Side"
                          isChecked={sideBySideOrientation}
                          onChange={this.handleOrientationChange}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                    <ToolbarGroup className={toolbarRight}>
                      <ToolbarItem>
                        <TextInput
                          id="log_show"
                          name="log_show"
                          style={{ width: '10em' }}
                          autoComplete="on"
                          type="text"
                          onKeyPress={this.checkSubmitShow}
                          onChange={this.updateShow}
                          defaultValue={this.state.showLogValue}
                          aria-label="show log text"
                          placeholder="Show..."
                        />
                      </ToolbarItem>
                      <ToolbarItem>
                        {this.state.showClearShowLogButton && (
                          <Tooltip key="clear_show_log" position="top" content="Clear Show Log Entries...">
                            <Button variant={ButtonVariant.control} onClick={this.clearShow}>
                              <KialiIcon.Close />
                            </Button>
                          </Tooltip>
                        )}
                      </ToolbarItem>

                      <ToolbarItem>
                        <TextInput
                          id="log_hide"
                          name="log_hide"
                          style={{ width: '10em' }}
                          autoComplete="on"
                          type="text"
                          onKeyPress={this.checkSubmitHide}
                          onChange={this.updateHide}
                          defaultValue={this.state.hideLogValue}
                          aria-label="hide log text"
                          placeholder="Hide..."
                        />
                      </ToolbarItem>
                      <ToolbarItem>
                        {this.state.showClearHideLogButton && (
                          <Tooltip key="clear_hide_log" position="top" content="Clear Hide Log Entries...">
                            <Button variant={ButtonVariant.control} onClick={this.clearHide}>
                              <KialiIcon.Close />
                            </Button>
                          </Tooltip>
                        )}
                      </ToolbarItem>
                      <ToolbarItem>
                        <Tooltip key="show_hide_log_help" position="top" content="Show/Hide Help...">
                          <KialiIcon.Info className={infoIcons} />
                        </Tooltip>
                      </ToolbarItem>
                      <ToolbarItem style={{ marginLeft: '1em' }}>
                        <Switch
                          id="regex-switch"
                          label="Activate Regex"
                          isChecked={this.state.useRegex}
                          onChange={this.handleRegexChange}
                        />
                        <Tooltip key="show_log_regex_help" position="top" content="Regex Help...">
                          <KialiIcon.Info className={infoIcons} />
                        </Tooltip>
                      </ToolbarItem>
                    </ToolbarGroup>
                  </Toolbar>
                  <Splitter
                    position={!sideBySideOrientation ? 'horizontal' : 'vertical'}
                    primaryPaneMaxHeight="100%"
                    primaryPaneMinHeight={30}
                    primaryPaneHeight={this.state.splitPercent}
                    dispatchResize={true}
                    postPoned={true}
                  >
                    <div className={sideBySideOrientation ? appLogsDivHorizontal : appLogsDivVertical}>
                      <textarea
                        className={logsTextarea(
                          !this.state.loadingAppLogs && this.state.appLogs?.logs !== NoAppLogsFoundMessage
                        )}
                        ref={this.appLogsRef}
                        readOnly={true}
                        value={this.state.filteredAppLogs ? this.state.filteredAppLogs : this.state.appLogs?.logs}
                        aria-label="Pod logs text"
                      />
                    </div>
                    <div className={proxyLogsDiv}>
                      <Title size="sm" headingLevel="h5" className={logsTitle}>
                        Istio proxy (sidecar)
                      </Title>
                      <textarea
                        className={logsTextarea(this.state.proxyLogs?.logs !== NoProxyLogsFoundMessage)}
                        ref={this.proxyLogsRef}
                        readOnly={true}
                        aria-label="Proxy logs text"
                        value={this.state.filteredProxyLogs ? this.state.filteredProxyLogs : this.state.proxyLogs?.logs}
                      />
                    </div>
                  </Splitter>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        )}
        {this.state.loadingAppLogsError && <div>{this.state.loadingAppLogsError}</div>}
      </RenderComponentScroll>
    );
  }

  private setPod = (podValue: string) => {
    const pod = this.props.pods[Number(podValue)];
    const containerInfo = this.getContainerInfo(pod);
    this.setState({ containerInfo: containerInfo, podValue: Number(podValue) });
  };

  private setContainer = (container: string) => {
    this.setState({
      containerInfo: { container: container, containerOptions: this.state.containerInfo!.containerOptions }
    });
  };

  private setTimeRange = (range: TimeRange) => {
    this.setState({ duration: range as DurationInSeconds });
  };

  private setTailLines = (tailLines: number) => {
    this.setState({ tailLines: tailLines });
  };

  private handleOrientationChange = (isChecked: boolean) => {
    this.setState({ sideBySideOrientation: isChecked, splitPercent: '50%' });
  };

  private handleRegexChange = (isChecked: boolean) => {
    this.setState({ useRegex: isChecked });
  };

  private handleRefresh = () => {
    const pod = this.props.pods[this.state.podValue!];
    this.fetchLogs(
      this.props.namespace,
      pod.name,
      this.state.containerInfo!.container,
      this.state.tailLines,
      this.state.duration
    );
  };

  private doShowAndHide = () => {
    if (this.state.hideLogValue) {
      this.hideLogLines(this.state.hideLogValue);
    }
    if (this.state.showLogValue) {
      this.showLogLines(this.state.showLogValue);
    }
  };

  private checkSubmitShow = event => {
    const keyCode = event.keyCode ? event.keyCode : event.which;
    if (keyCode === RETURN_KEY_CODE) {
      event.preventDefault();
      this.doShowAndHide();
    }
  };

  private updateShow = val => {
    if ('' === val) {
      this.clearShow();
    } else {
      this.setState({ showLogValue: val });
    }
  };

  private showLogLines = (showValue: string) => {
    if (showValue === '') {
      this.clearHide();
      this.setState({ showClearShowLogButton: false });
    }
    if (showValue !== '') {
      let appLines: string[];
      let proxyLogLines: string[];

      // setup appropriate input and split into log entries
      if (this.state.hideFilteredAppLogs) {
        appLines = this.state.hideFilteredAppLogs.split('\n');
      } else {
        if (this.state.appLogs && this.state.appLogs.logs) {
          appLines = this.state.appLogs.logs?.split('\n');
        }
      }
      if (this.state.hideFilteredProxyLogs) {
        proxyLogLines = this.state.hideFilteredProxyLogs.split('\n');
      } else {
        if (this.state.proxyLogs && this.state.proxyLogs.logs) {
          proxyLogLines = this.state.proxyLogs.logs?.split('\n');
        }
      }

      // @ts-ignore
      const filteredAppLogLines = appLines
        .map((line: string) => {
          return line.toLowerCase().includes(showValue.toLowerCase()) ? line : undefined;
        })
        .filter(line => {
          // return non-undefined lines
          return line;
        })
        .join('\n ');

      // @ts-ignore
      const filteredProxyLogLines = proxyLogLines
        .map((line: string) => {
          return line.toLowerCase().includes(showValue.toLowerCase()) ? line : undefined;
        })
        .filter(line => {
          // return non-undefined lines
          return line;
        })
        .join('\n ');

      this.setState({
        showClearShowLogButton: true,
        filteredAppLogs: filteredAppLogLines,
        filteredProxyLogs: filteredProxyLogLines
      });
    }
  };

  private clearShow = () => {
    // TODO: when TextInput refs are fixed in PF4 then use the ref and remove the direct HTMLElement usage
    // this.showInputRef.value = '';
    const htmlInputElement: HTMLInputElement = document.getElementById('log_show') as HTMLInputElement;
    if (htmlInputElement !== null) {
      htmlInputElement.value = '';
    }

    this.setState({
      showLogValue: '',
      showClearShowLogButton: false,
      filteredAppLogs: undefined,
      filteredProxyLogs: undefined
    });
  };

  private checkSubmitHide = event => {
    const keyCode = event.keyCode ? event.keyCode : event.which;
    if (keyCode === RETURN_KEY_CODE) {
      event.preventDefault();
      this.doShowAndHide();
    }
  };

  private updateHide = val => {
    if ('' === val) {
      this.clearHide();
    } else {
      this.setState({ hideLogValue: val });
    }
  };

  private hideLogLines = (filterValue: string) => {
    if (filterValue === '') {
      this.clearHide();
      this.setState({ showClearShowLogButton: false });
    }
    if (filterValue !== '' && this.state.appLogs?.logs && this.state.proxyLogs?.logs) {
      const appLines: string[] = this.state.appLogs.logs.split('\n');
      const proxyLogLines: string[] = this.state.proxyLogs.logs.split('\n');

      const filteredAppLogLines = appLines
        .map((line: string) => {
          return !line.toLowerCase().includes(filterValue.toLowerCase()) ? line : undefined;
        })
        .filter(line => {
          // return non-undefined lines
          return line;
        })
        .join('\n ');

      const filteredProxyLogLines = proxyLogLines
        .map((line: string) => {
          return !line.toLowerCase().includes(filterValue.toLowerCase()) ? line : undefined;
        })
        .filter(line => {
          // return non-undefined lines
          return line;
        })
        .join('\n ');

      const onlyHideIsSet = filterValue !== '' && this.state.showLogValue === '';
      if (onlyHideIsSet) {
        this.setState({
          showClearHideLogButton: true,
          filteredAppLogs: filteredAppLogLines,
          filteredProxyLogs: filteredProxyLogLines
        });
      } else {
        this.setState({
          showClearHideLogButton: true,
          hideFilteredAppLogs: filteredAppLogLines,
          hideFilteredProxyLogs: filteredProxyLogLines
        });
      }
    }
  };

  private clearHide = () => {
    // TODO: when TextInput refs are fixed in PF4 then use the ref and remove the direct HTMLElement usage
    // this.hideInputRef.value = '';
    const htmlInputElement: HTMLInputElement = document.getElementById('log_hide') as HTMLInputElement;
    if (htmlInputElement !== null) {
      htmlInputElement.value = '';
    }

    this.setState({
      hideLogValue: '',
      showClearHideLogButton: false,
      filteredAppLogs: undefined,
      filteredProxyLogs: undefined
    });
  };

  private getContainerInfo = (pod: Pod): ContainerInfo => {
    const containers = pod.containers ? pod.containers : [];
    containers.push(...(pod.istioContainers ? pod.istioContainers : []));
    const containerNames: string[] = containers.map(c => c.name);
    const options: string[] = [];

    containerNames.forEach(c => {
      // ignore the proxy
      if (c !== 'istio-proxy') {
        if (pod.appLabel && pod.labels) {
          options[c] = c + '-' + pod.labels['version'];
        } else {
          options[c] = c;
        }
      }
    });
    return { container: containerNames[0], containerOptions: options };
  };

  private fetchLogs = (
    namespace: string,
    podName: string,
    container: string,
    tailLines: number,
    duration: DurationInSeconds
  ) => {
    const sinceTime = Math.floor(Date.now() / 1000) - duration;
    const promise: Promise<Response<PodLogs>> = getPodLogs(namespace, podName, container, tailLines, sinceTime);
    const containerPromise: Promise<Response<PodLogs>> = getPodLogs(
      namespace,
      podName,
      'istio-proxy',
      tailLines,
      sinceTime
    );
    this.loadContainerLogsPromise = makeCancelablePromise(Promise.all([containerPromise]));
    this.loadPodLogsPromise = makeCancelablePromise(Promise.all([promise]));

    this.loadPodLogsPromise.promise
      .then(response => {
        const podLogs = response[0].data;
        this.setState({
          loadingAppLogs: false,
          appLogs: podLogs.logs ? podLogs : { logs: NoAppLogsFoundMessage }
        });
        this.appLogsRef.current.scrollTop = this.appLogsRef.current.scrollHeight;
        return;
      })
      .catch(error => {
        if (error.isCanceled) {
          console.debug('PodLogs: Ignore fetch error (canceled).');
          this.setState({ loadingAppLogs: false });
          return;
        }
        const errorMsg = error.response && error.response.data.error ? error.response.data.error : error.message;
        this.setState({
          loadingAppLogs: false,
          appLogs: { logs: `Failed to fetch pod logs: ${errorMsg}` }
        });
      });

    this.loadContainerLogsPromise.promise
      .then(response => {
        const containerLogs = response[0].data;
        this.setState({
          loadingProxyLogs: false,
          proxyLogs: containerLogs.logs ? containerLogs : { logs: NoProxyLogsFoundMessage }
        });
        this.appLogsRef.current.scrollTop = this.appLogsRef.current.scrollHeight;
        return;
      })
      .catch(error => {
        if (error.isCanceled) {
          console.debug('ContainerLogs: Ignore fetch error (canceled).');
          this.setState({ loadingProxyLogs: false });
          return;
        }
        const errorMsg = error.response && error.response.data.error ? error.response.data.error : error.message;
        this.setState({
          loadingProxyLogs: false,
          proxyLogs: { logs: `Failed to fetch container logs: ${errorMsg}` }
        });
      });

    this.setState({
      loadingAppLogs: true,
      loadingProxyLogs: true,
      appLogs: undefined,
      proxyLogs: undefined
    });
  };
}
