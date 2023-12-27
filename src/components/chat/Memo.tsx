"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { backend_api } from "@/utils/api";
import { AxiosResponse } from "axios";
import { Stack } from "@mui/system";
import { IconButton, styled, TextField } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface MemoItem {
  id: number;
  contents: string;
  createdAt: string;
}

const PostIt = styled(TextField)(() => ({
  width: "90%",
  margin: "5px auto",
  backgroundColor: "#fff6fa",
  borderRadius: 2,
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "transparent",
    },
    "&:hover fieldset": {
      borderColor: "transparent",
    },
    "&.Mui-focused fieldset": {
      borderColor: "transparent",
    },
  },
}));

const PostItInput = styled(TextField)(() => ({
  width: "90%",
  margin: "auto",
  marginBottom: 15,
  backgroundColor: "#f5f5f5",
  borderRadius: 2,
  // focused color for input with variant='outlined'
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "transparent",
    },
    "&:hover fieldset": {
      borderColor: "#ff8fab",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ff8fab",
    },
  },
}));

const Memo = () => {
  const [memoList, setMemoList] = useState<MemoItem[]>([]);
  const [memoText, setMemoText] = useState<string>("");
  const [mymemo, setMymemo] = useState<MemoItem[]>([]);
  //create
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMemoText(event.target.value);
  };
  const handleSaveMemo = async () => {
    try {
      const newMemo: MemoItem = {
        id: Date.now(),
        contents: memoText,
        createdAt: "",
      };
      const createdMemo = await createMemo(newMemo);
      setMymemo((prevMemoList) => [...prevMemoList, createdMemo]);
      setMemoText("");
    } catch (error) {
      console.error("Error saving memo:", error);
    }
  };

  const createMemo = async (newMemo: MemoItem) => {
    try {
      const response = await backend_api().post("/memos", {
        id: newMemo.id,
        contents: newMemo.contents,
      });
      if (response.status >= 200 && response.status < 300) {
        const createdMemo: MemoItem = await response.data.data;
        return createdMemo;
      } else {
        throw new Error("Failed to create memo");
      }
    } catch (error) {
      console.error("Error creating memo:", error);
      throw error;
    }
  };

  //read!!
  useEffect(() => {
    const myMemo = async () => {
      const response = await backend_api()
        .get(`memos/my`)
        .then((response: AxiosResponse) => {
          if (response && response.data) {
            setMymemo([...response.data]);
          }
        });
    };
    myMemo();
  }, []);

  //delete
  const handleDeleteMemo = async (id: number) => {
    try {
      await deleteMemo(id);
      setMemoList((prevMemoList) =>
        prevMemoList.filter((memo) => memo.id !== id),
      );
      setMymemo((prevMemoList) =>
        prevMemoList.filter((mememo) => mememo.id !== id),
      );
    } catch (error) {
      console.error("Error deleting memo:", error);
    }
  };
  const deleteMemo = async (id: number) => {
    try {
      const response = await backend_api().delete(`/memos/${id}`);
      if (response.status >= 200 && response.status < 300) {
        return;
      } else {
        throw new Error("Failed to delete memo");
      }
    } catch (error) {
      console.error("Error deleting memo:", error);
      throw error;
    }
  };

  // update, modify
  const [editingMemo, setEditingMemo] = useState<{
    id: number | null;
    contents: string;
  }>({ id: null, contents: "" });

  // 수정 상태를 활성화하고 해당 메모의 내용을 가져오는 함수
  const handleEditMemo = (id: number, contents: string) => {
    setEditingMemo({ id, contents });
  };

  // 수정된 내용을 서버에 업데이트하는 함수
  const handleUpdateMemo = async () => {
    try {
      await updateMemo(editingMemo.id || 0, editingMemo.contents);
      // 서버에 업데이트 후 로컬 상태 업데이트
      setMymemo((prevMymemo) =>
        prevMymemo.map((memo) =>
          memo.id === editingMemo.id
            ? { ...memo, contents: editingMemo.contents }
            : memo,
        ),
      );
      setEditingMemo({ id: null, contents: "" }); // 수정 상태 비활성화
    } catch (error) {
      console.error("Error updating memo:", error);
    }
  };

  // 서버에 메모를 업데이트하는 함수
  const updateMemo = async (id: number, contents: string) => {
    try {
      const response = await backend_api().put(`/memos/${id}`, { contents });
      if (response.status >= 200 && response.status < 300) {
        return;
      } else {
        throw new Error("Failed to update memo");
      }
    } catch (error) {
      console.error("Error updating memo:", error);
      throw error;
    }
  };

  const handleEnter = (event) => {
    if (event.keyCode === 13) {
      handleSaveMemo();
    }
  };

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        width: "100%",
        maxWidth: "500px",
        height: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 2,
      }}
    >
      <div style={{ width: "100%", marginTop: 10, overflowY: "auto" }}>
        {mymemo.length > 0 &&
          mymemo.map((memomo) => (
            <div
              key={memomo.id}
              style={{ display: "flex", alignItems: "center" }}
            >
              {editingMemo.id === memomo.id ? (
                <PostItInput
                  key={memomo.id}
                  multiline
                  rows={4}
                  value={editingMemo.contents}
                  onChange={(event) =>
                    setEditingMemo({
                      ...editingMemo,
                      contents: event.target.value,
                    })
                  }
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        color="primary"
                        onClick={handleUpdateMemo}
                        sx={{ position: "absolute", top: "60%", right: "3%" }}
                      >
                        <SaveIcon />
                      </IconButton>
                    ),
                  }}
                />
              ) : (
                <PostIt
                  multiline
                  rows={4}
                  value={memomo.contents}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Stack direction={"row"}>
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handleEditMemo(memomo.id, memomo.contents)
                          }
                          sx={{
                            position: "absolute",
                            top: "60%",
                            right: "12%",
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleDeleteMemo(memomo.id)}
                          sx={{ position: "absolute", top: "60%", right: "3%" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    ),
                  }}
                />
              )}
            </div>
          ))}
      </div>
      <PostItInput
        multiline
        placeholder={"메모를 입력하세요."}
        rows={4}
        value={memoText}
        onChange={handleInputChange}
        onKeyDown={handleEnter}
        InputProps={{
          endAdornment: (
            <IconButton
              color="primary"
              onClick={handleSaveMemo}
              sx={{ position: "absolute", top: "60%", right: "3%" }}
            >
              <SaveIcon />
            </IconButton>
          ),
        }}
      />
    </Stack>
  );
};

export default Memo;
