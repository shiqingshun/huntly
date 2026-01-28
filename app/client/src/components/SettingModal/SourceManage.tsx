import React, {useEffect, useState} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import {Source, SourceControllerApiFactory} from "../../api";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useSnackbar} from "notistack";

export function SourceManage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [open, setOpen] = useState(false);
  const [currentSource, setCurrentSource] = useState<Source>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null);
  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = () => {
    SourceControllerApiFactory().getSourcesUsingGET().then((response) => {
      setSources(response.data);
    });
  };

  const handleEditClick = (source: Source) => {
    setCurrentSource(source);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentSource({});
  };

  const handleSave = () => {
    SourceControllerApiFactory().saveSourceUsingPOST(currentSource).then(() => {
      enqueueSnackbar('保存成功', {
        variant: "success",
        anchorOrigin: {vertical: "bottom", horizontal: "center"}
      });
      handleClose();
      loadSources();
    });
  };

  const handleDeleteClick = (source: Source) => {
    setSourceToDelete(source);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSourceToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (sourceToDelete?.id) {
      SourceControllerApiFactory().deleteSourceUsingDELETE(sourceToDelete.id).then(() => {
        enqueueSnackbar('删除成功', {
          variant: "success",
          anchorOrigin: {vertical: "bottom", horizontal: "center"}
        });
        handleDeleteCancel();
        loadSources();
      });
    }
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>网站名称</TableCell>
              <TableCell>域名</TableCell>
              <TableCell>Favicon</TableCell>
              <TableCell>文章数量</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell>{source.siteName}</TableCell>
                <TableCell>{source.domain}</TableCell>
                <TableCell>
                  {source.faviconUrl && (
                    <img src={source.faviconUrl} alt="favicon" className="w-4 h-4"/>
                  )}
                </TableCell>
                <TableCell>{source.total}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(source)}>
                    <EditIcon/>
                  </IconButton>
                  {source.total === 0 && (
                    <IconButton onClick={() => handleDeleteClick(source)} color="error">
                      <DeleteIcon/>
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>编辑Source</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="网站名称"
            fullWidth
            value={currentSource.siteName || ''}
            onChange={(e) => setCurrentSource({...currentSource, siteName: e.target.value})}
          />
          <TextField
            margin="dense"
            label="域名"
            fullWidth
            value={currentSource.domain || ''}
            onChange={(e) => setCurrentSource({...currentSource, domain: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Favicon URL"
            fullWidth
            value={currentSource.faviconUrl || ''}
            onChange={(e) => setCurrentSource({...currentSource, faviconUrl: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          确定要删除 {sourceToDelete?.siteName} 吗？
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error">删除</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}