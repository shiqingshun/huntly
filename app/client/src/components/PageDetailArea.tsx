import {useQuery, useQueryClient} from "@tanstack/react-query";
import {ArticleShortcutControllerApiFactory, PageControllerApiFactory, PageDetail} from "../api";
import Loading from "../components/Loading";
import {PageQueryKey} from "../domain/pageQueryKey";
import * as React from "react";
import {useEffect, useState} from "react";
import styles from "./PageDetail.module.css";
import CardMedia from "@mui/material/CardMedia";
import SmartMoment from "../components/SmartMoment";
import PageOperationButtons, {PageOperateEvent, PageOperation} from "../components/PageOperationButtons";
import {Box, CircularProgress, IconButton, Menu, MenuItem, Paper, Snackbar, Tooltip, Typography} from "@mui/material";
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import {setDocTitle} from "../common/docUtils";
import ScreenSearchDesktopOutlinedIcon from '@mui/icons-material/ScreenSearchDesktopOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ScreenSearchDesktopRoundedIcon from '@mui/icons-material/ScreenSearchDesktopRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShortTextIcon from '@mui/icons-material/ShortText';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// 引入 TurndownService
import TurndownService from 'turndown';

const PageDetailArea = ({
                           id,
                           onOperateSuccess
                         }: { id: number, onOperateSuccess?: (event: PageOperateEvent) => void }) => {
  const queryKey = [PageQueryKey.PageDetail, id];
  const queryClient = useQueryClient();
  const [isFullContent, setIsFullContent] = React.useState(false);
  const [isProcessingContent, setIsProcessingContent] = useState(false);
  const [processedContent, setProcessedContent] = useState<string>("");
  const [showProcessedSection, setShowProcessedSection] = useState(false);
  const [processedTitle, setProcessedTitle] = useState<string>("AI 处理结果");
  const [processingError, setProcessingError] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  // AI操作菜单状态
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  
  // 获取可用的文章快捷指令
  const { data: shortcuts = [] } = useQuery(
    ["enabled-article-shortcuts"],
    async () => {
      const response = await ArticleShortcutControllerApiFactory().getEnabledShortcutsUsingGET();
      return response.data;
    }
  );

  const {
    isLoading,
    error,
    data: detail
  } = useQuery(queryKey, async () => (await PageControllerApiFactory().getPageDetailByIdUsingGET(id)).data, {
    onSuccess: (data) => {
      if (data && data.page) {
        setDocTitle(data.page.title);
        if (data.pageContents) {
          const rawContent = data.pageContents.find((content) => content.articleContentCategory === 0);
          setIsFullContent(rawContent != null);
        }
      }
    }
  });

  let iconUrl = "";
  let siteName = "";
  if (detail && detail.connector) {
    iconUrl = detail.connector.iconUrl;
    siteName = detail.connector.name;
  }
  if (!iconUrl && detail && detail.source) {
    iconUrl = detail.source.faviconUrl;
  }
  if (!siteName && detail && detail.source) {
    siteName = detail.source.siteName;
  }

  useEffect(() => {
    PageControllerApiFactory().recordReadPageUsingPOST(id);
    
    // 重置处理结果状态
    setShowProcessedSection(false);
    setProcessedContent("");
    setProcessedTitle("AI 处理结果");
    setProcessingError("");
  }, [id]);

  function operateSuccess(event: PageOperateEvent) {
    if (event.operation !== PageOperation.delete) {
      queryClient.setQueryData<PageDetail>(queryKey, (data) => ({
        ...data,
        page: {
          ...data.page,
          starred: event.result.starred,
          readLater: event.result.readLater,
          librarySaveStatus: event.result.librarySaveStatus,
        }
      }));
    }
    if (onOperateSuccess) {
      onOperateSuccess(event);
    }
  }

  async function loadFullContent() {
    const fullContent = await PageControllerApiFactory().fetchFullContentByIdUsingPOST(id);
    if (fullContent && fullContent.data) {
      updateContent(fullContent.data.content);
      setIsFullContent(true);
    }
  }
  
  async function processWithShortcut(shortcutId: number, shortcutName: string) {
    if (isProcessingContent) return; // Prevent multiple requests
    
    setIsProcessingContent(true);
    setShowProcessedSection(true);
    setProcessedContent("");
    setProcessedTitle(shortcutName);
    setProcessingError(""); // 清除之前的错误状态
    
    try {
      // Use EventSource for SSE handling with fast mode
      const eventSource = new EventSource(`/api/page/processWithShortcut/${id}?shortcutId=${shortcutId}&mode=fast`);
      let hasReceivedData = false;
      
      eventSource.onmessage = (event) => {
        hasReceivedData = true;
        const data = event.data;
        
        try {
          // 尝试解析JSON格式的内容
          const parsedData = JSON.parse(data);
          // 如果是字符串，说明是fast模式下的文本内容
          if (typeof parsedData === 'string') {
            setProcessedContent(prev => prev + parsedData);
          } else {
            // 如果不是字符串，可能是其他格式的数据，直接使用
            setProcessedContent(prev => prev + data);
          }
        } catch (e) {
          // 解析JSON失败，说明不是JSON格式，直接使用原始数据
          setProcessedContent(prev => prev + data);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error(`SSE error for shortcut ${shortcutName}:`, error);
        
        // 只有在连接状态不是CLOSED且没有接收到数据时才认为是真正的错误
        if (eventSource.readyState !== EventSource.CLOSED && !hasReceivedData) {
          setProcessingError('连接服务器时发生错误，请稍后重试。');
        }
        
        setIsProcessingContent(false);
        eventSource.close();
      };
      
      // Handle named error events (服务端主动发送的错误事件)
      eventSource.addEventListener('error', (event) => {
        console.error('SSE named error event:', event);
        if ((event as any).data) {
          try {
            const errorData = JSON.parse((event as any).data);
            setProcessingError(`处理失败: ${errorData.message || '未知错误'}`);
          } catch (e) {
            setProcessingError('处理过程中发生未知错误。');
          }
        }
        setIsProcessingContent(false);
        eventSource.close();
      });
      
      // Set a timeout to prevent hanging connections
      const timeout = setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          console.warn('SSE connection timeout');
          setIsProcessingContent(false);
          setProcessingError('处理超时，请稍后重试。');
          eventSource.close();
        }
      }, 300000); // 5 minutes timeout
      
      // Handle connection close (正常关闭)
      eventSource.addEventListener('close', () => {
        clearTimeout(timeout);
        setIsProcessingContent(false);
      });
      
    } catch (error) {
      console.error(`Error processing with shortcut ${shortcutName}:`, error);
      setIsProcessingContent(false);
      setProcessingError('连接失败，请检查网络连接。');
    }
  }

  function updateContent(content) {
    queryClient.setQueryData<PageDetail>(queryKey, (data) => {
      return {
        ...data,
        page: {
          ...data.page,
          content: content
        }
      };
    });
  }

  async function switchRawContent() {
    const rawContent = await PageControllerApiFactory().switchRawContentByIdUsingPOST(id);
    if (rawContent && rawContent.data) {
      updateContent(rawContent.data.content);
      setIsFullContent(false);
    }
  }
  
  // AI操作菜单处理函数
  const handleAIMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAIMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleShortcutSelect = (shortcutId: number, shortcutName: string) => {
    processWithShortcut(shortcutId, shortcutName);
    handleAIMenuClose();
  };

  // 导出Markdown功能
  const exportToMarkdown = () => {
    if (!detail) return;
    
    const title = detail.page.title || 'Untitled';
    const url = detail.page.url || '';
    
    // 直接使用 detail.page.content 获取内容
    const content = detail.page.content || '';
    
    // 使用 Turndown 将 HTML 转换为 Markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
    });
    
    // 添加表格支持
    turndownService.addRule('table', {
      filter: 'table',
      replacement: function(content) {
        return '\n' + content + '\n';
      }
    });
    
    // 转换 HTML 到 Markdown
    let markdownContent = turndownService.turndown(content);
    
    // 添加标题和链接
    markdownContent = `# ${title}\n\n[Original link](${url})\n\n${markdownContent}`;
    
    // 创建Blob对象
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.md`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 复制 Markdown 文本功能
  const copyMarkdownToClipboard = () => {
    if (!detail) return;
    
    const title = detail.page.title || 'Untitled';
    const url = detail.page.url || '';
    
    // 直接使用 detail.page.content 获取内容
    const content = detail.page.content || '';
    
    // 使用 Turndown 将 HTML 转换为 Markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
    });
    
    // 添加表格支持
    turndownService.addRule('table', {
      filter: 'table',
      replacement: function(content) {
        return '\n' + content + '\n';
      }
    });
    
    // 转换 HTML 到 Markdown
    let markdownContent = turndownService.turndown(content);
    
    // 添加标题和链接
    markdownContent = `# ${title}\n\n[Original link](${url})\n\n${markdownContent}`;
    
    // 复制到剪贴板
    navigator.clipboard.writeText(markdownContent)
      .then(() => {
        setSnackbarMessage("Markdown content copied to clipboard");
        setSnackbarOpen(true);
      })
      .catch(err => {
        setSnackbarMessage("Failed to copy, please copy manually");
        setSnackbarOpen(true);
        console.error('Failed to copy:', err);
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="pl-2 pr-2 flex flex-col items-center">
      {isLoading && <Loading/>}
      {error && <p>error...</p>}
      {detail && (
        <Paper
          className={"page-detail-paper"}
          sx={{maxWidth: 800, minWidth: 800}}
          key={detail.page.id}
          elevation={2}
        >
          <div
            className={'bg-sky-50 pl-2 pr-2 pt-1 pb-1 mb-4 border-0 border-solid border-b-[2px] border-b-blue-100 sticky top-0 backdrop-blur-2xl bg-opacity-60 z-40'}>
            <Box sx={{}} className={"flex items-center justify-between"}>
              <div className={'flex items-center'}>
                <a href={detail.page.url} target={"_blank"} rel="noreferrer" className={'hover:underline'}>
                  <div className={"flex items-center"}>
                    {iconUrl &&
                      <span className={"mr-2"}>
                        <CardMedia component={'img'} image={iconUrl}
                                   sx={{
                                     width: 16, height: 16
                                   }}/>
                      </span>
                    }
                    <Typography variant={"body2"} color={"text.secondary"} component={"span"}
                                className={'flex'}>
                       <span
                         className={"max-w-[260px] text-ellipsis break-all whitespace-nowrap overflow-hidden"}>
                         {siteName}
                       </span>
                      <span className={"mr-1 ml-1"}>·</span>
                      <SmartMoment
                        dt={detail.page.connectorId ? detail.page.connectedAt : detail.page.createdAt}></SmartMoment>
                    </Typography>
                  </div>
                </a>

                <span className={'ml-2'}>
                    <Tooltip title={'Load full content'} placement={"bottom"}>
                      {
                        isFullContent ? <IconButton onClick={switchRawContent}>
                          <ScreenSearchDesktopRoundedIcon fontSize={"small"}/>
                        </IconButton> : <IconButton onClick={loadFullContent}>
                          <ScreenSearchDesktopOutlinedIcon fontSize={"small"}/>
                        </IconButton>
                      }
                    </Tooltip>
                    
                    <Tooltip title={'Export to Markdown'} placement={"bottom"}>
                      <IconButton onClick={exportToMarkdown}>
                        <SaveAltIcon fontSize={"small"} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={'Copy Markdown content'} placement={"bottom"}>
                      <IconButton onClick={copyMarkdownToClipboard}>
                        <ContentCopyIcon fontSize={"small"} />
                      </IconButton>
                    </Tooltip>
                    
                    {shortcuts && shortcuts.length > 0 ? (
                      <>
                        <Tooltip title={'AI operations'} placement={"bottom"}>
                          <IconButton 
                            onClick={handleAIMenuClick}
                            aria-controls={openMenu ? 'ai-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={openMenu ? 'true' : undefined}
                          >
                            <SmartToyOutlinedIcon fontSize={"small"} sx={{ color: "#6366F1" }} />
                            <KeyboardArrowDownIcon fontSize={"small"} />
                          </IconButton>
                        </Tooltip>
                        
                        <Menu
                          id="ai-menu"
                          anchorEl={anchorEl}
                          open={openMenu}
                          onClose={handleAIMenuClose}
                          MenuListProps={{
                            'aria-labelledby': 'ai-button',
                          }}
                        >
                          {shortcuts.map((shortcut) => (
                            <MenuItem 
                              key={shortcut.id} 
                              onClick={() => handleShortcutSelect(shortcut.id!, shortcut.name!)}
                              disabled={isProcessingContent}
                            >
                              <ShortTextIcon fontSize="small" className="mr-2" sx={{ color: "#8B5CF6" }} />
                              {shortcut.name}
                            </MenuItem>
                          ))}
                        </Menu>
                      </>
                    ) : null}
                  </span>
              </div>

              <PageOperationButtons pageStatus={{
                id: detail.page.id,
                starred: detail.page.starred,
                readLater: detail.page.readLater,
                librarySaveStatus: detail.page.librarySaveStatus
              }} onOperateSuccess={operateSuccess}/>
            </Box>
          </div>

          <div className={'pl-4 pr-4 mb-4'}>
            <article className={styles["markdown-body"]}>
              <Typography variant={"h1"} sx={{marginBottom: 2}}>
                <a href={detail.page.url} target={"_blank"} rel="noreferrer" className={'!text-inherit'}>
                  {detail.page.title}
                </a>
              </Typography>
              
              {showProcessedSection && (
                <Paper elevation={0} className={"p-4 mb-5 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 transition-all duration-300 rounded-lg"}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="mr-2 bg-gradient-to-r from-blue-400 to-cyan-500 p-1.5 rounded-md text-white flex items-center justify-center">
                        <LightbulbOutlinedIcon fontSize="small" />
                      </div>
                      <Typography variant={"body2"} component={"div"} className={"font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text"}>
                        {processedTitle}
                      </Typography>
                    </div>
                    {isProcessingContent && (
                      <CircularProgress size={18} className="text-cyan-500" />
                    )}
                  </div>
                  
                  {/* 错误提示区域 */}
                  {processingError && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center">
                        <div className="mr-2 bg-red-500 p-1 rounded-full text-white flex items-center justify-center w-5 h-5">
                          <span className="text-xs">!</span>
                        </div>
                        <Typography variant={"body2"} className="text-red-700">
                          {processingError}
                        </Typography>
                      </div>
                    </div>
                  )}
                  
                  <Typography variant={"body2"} component={"div"} className={"markdown-content"}>
                    {isProcessingContent && !processedContent && !processingError ? (
                      <div className="flex flex-col space-y-2 h-12 animate-pulse">
                        <div className="h-2 bg-gradient-to-r from-blue-100 to-sky-100 rounded-full w-full opacity-70"></div>
                        <div className="h-2 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full w-5/6 opacity-70"></div>
                        <div className="h-2 bg-gradient-to-r from-blue-100 to-sky-100 rounded-full w-4/6 opacity-70"></div>
                      </div>
                    ) : processedContent ? (
                      <div className={`prose prose-sm max-w-none`}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({node, inline, className, children, ...props}) {
                              return (
                                <code className={`${className} bg-gray-100 rounded px-1`} {...props}>
                                  {children}
                                </code>
                              )
                            },
                            pre({node, children, ...props}) {
                              return (
                                <pre className="bg-gray-100 rounded p-2 overflow-auto" {...props}>
                                  {children}
                                </pre>
                              )
                            },
                            table({node, children, ...props}) {
                              return (
                                <div className="overflow-auto">
                                  <table className="border-collapse border border-gray-300" {...props}>
                                    {children}
                                  </table>
                                </div>
                              )
                            },
                            th({node, children, ...props}) {
                              return (
                                <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props}>
                                  {children}
                                </th>
                              )
                            },
                            td({node, children, ...props}) {
                              return (
                                <td className="border border-gray-300 px-4 py-2" {...props}>
                                  {children}
                                </td>
                              )
                            }
                          }}
                        >
                          {processedContent}
                        </ReactMarkdown>
                      </div>
                    ) : null}
                  </Typography>
                </Paper>
              )}
              
              <Typography variant={"body1"} component={'div'}>
                <div dangerouslySetInnerHTML={{__html: detail.page.content}}></div>
              </Typography>
            </article>
          </div>
        </Paper>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
};

export default PageDetailArea;
