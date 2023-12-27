"use client";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ImageList,
  ImageListItem,
  Stack,
} from "@mui/material";
import imageUrls from "@/mock/faceFilters.json";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import React, { useState } from "react";
import Typography from "@mui/material/Typography";

interface Props {
  popupOpen: boolean;
  onClose: () => void;
  onClickApplyFilter: (filterUrl: string, toPartner: boolean) => void;
}

const FilterSelectDialog = ({
  popupOpen,
  onClose,
  onClickApplyFilter,
}: Props) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const handleClose = (event, reason) => {
    if (reason && reason == "backdropClick") return;
    onClose();
  };

  return (
    <Dialog open={popupOpen} onClose={handleClose}>
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <DialogTitle>
          <Typography variant={"h4"}>필터 선택하기</Typography>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
      <DialogContent sx={{ margintTop: 0 }}>
        <ImageList sx={{ width: 400, height: 400 }} cols={3} rowHeight={120}>
          {imageUrls.map((url, index) => (
            <ImageListItem key={url} style={{ margin: "auto" }}>
              <img
                key={index}
                src={url}
                alt={"face_filter"}
                style={{
                  width: 120,
                  height: 120,
                  boxShadow: "0px 0px 3px rgba(0, 0, 0, 0.2)",
                  borderRadius: 10,
                  border: index === selectedIndex ? "2px solid #FFAFCC" : "",
                }}
                onClick={() => {
                  setSelectedFilter(url);
                  setSelectedIndex(index);
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      </DialogContent>
      <DialogActions>
        <Stack
          direction={"row"}
          spacing={2}
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <Button
            variant={"outlined"}
            onClick={() => onClickApplyFilter(selectedFilter, true)}
            sx={{ width: "100%", borderRadius: 2, height: 40 }}
          >
            <Typography sx={{ fontWeight: 600 }}>
              상대방에게 씌워주기
            </Typography>
          </Button>
          <Button
            variant={"outlined"}
            onClick={() => onClickApplyFilter(selectedFilter, false)}
            sx={{ width: "100%", borderRadius: 2, height: 40 }}
          >
            <Typography sx={{ fontWeight: 600 }}>나에게 씌우기</Typography>
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default FilterSelectDialog;
