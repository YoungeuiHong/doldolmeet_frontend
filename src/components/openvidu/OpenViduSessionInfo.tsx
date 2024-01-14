import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import { useEffect, useState } from "react";
import { useAllOpenViduSessions } from "@/hooks/openvidu";
import { IconButton, Stack } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Typography from "@mui/material/Typography";
import { backend_api } from "@/utils/api";

interface Props {
  fanMeetingId: string | null | undefined;
}

const OpenViduSessionInfo = ({ fanMeetingId }: Props) => {
  const [sessionCnt, setSessionCnt] = useState<number>(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any[]>([]);
  const { data, refetch } = useAllOpenViduSessions();

  useEffect(() => {
    setSessionCnt(data?.numberOfElements);
    setSessions(data?.content);
  }, [data]);

  const fetchSessionInfo = async () => {
    try {
      const response = await backend_api().get(
        `/roomOrder/all/${fanMeetingId}`,
      ); // fanMeetingId를 적절한 값으로 대체
      const data = response.data.data;
      console.log("#################", data);

      setOrderData(data);
    } catch (error) {
      console.error("Error fetching session info:", error);
    }
  };

  useEffect(() => {
    fetchSessionInfo();
  }, [fanMeetingId]);

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="flex-end"
      spacing={2}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Typography>총 세션 개수: {sessionCnt}</Typography>
        <IconButton onClick={() => refetch()}>
          <RefreshIcon />
        </IconButton>
      </Stack>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>세션 정보</TableCell>
              <TableCell>세션 아이디</TableCell>
              <TableCell align="right">접속 개수</TableCell>
              <TableCell align="right">접속 정보</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions &&
              sessions.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  {orderData &&
                    orderData
                      .filter((order) => order.currentRoom === row.id)
                      .map((filteredOrder) => (
                        <TableCell
                          key={filteredOrder.id}
                          component="th"
                          scope="row"
                        >
                          {filteredOrder.idolName} - {filteredOrder.type}
                        </TableCell>
                      ))}

                  <TableCell component="th" scope="row">
                    {row.id}
                  </TableCell>
                  <TableCell align="right">
                    {row.connections.numberOfElements}
                  </TableCell>
                  <TableCell align="right">
                    {row.connections.content
                      .map((connection) => {
                        const clientData = JSON.parse(
                          connection.clientData,
                        ).clientData;
                        return JSON.parse(clientData).userName;
                      })
                      .join(", ")}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default OpenViduSessionInfo;
