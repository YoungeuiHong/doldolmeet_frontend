import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import SvgColor from "../svg/SvgColor";
import { covertDateTime } from "@/utils/datetime";

// ----------------------------------------------------------------------
export interface Author {
  name: string;
  avatarUrl: string;
}

export interface Post {
  cover: any;
  title: string;
  view: number;
  comment: number;
  share: number;
  author: Author;
  createdAt: string;
}

export interface FanMeeting {
  id: number;
  imgUrl: string;
  profileImgUrl: string;
  title: string;
  startTime: string;
}

interface Props {
  fanMeeting: FanMeeting;
  index: number;
}

export default function PostCard({ fanMeeting, index }: Props) {
  const { id, imgUrl, profileImgUrl, title, startTime } = fanMeeting;

  const renderAvatar = (
    <Avatar
      alt={id.toString()}
      src={profileImgUrl}
      sx={{
        zIndex: 9,
        width: 32,
        height: 32,
        position: "absolute",
        left: (theme) => theme.spacing(3),
        bottom: (theme) => theme.spacing(-2),
      }}
    />
  );

  const renderTitle = (
    <Link
      href={`/fanmeeting-list/${id}`}
      color="inherit"
      variant="h6"
      underline="hover"
      sx={{
        height: 44,
        overflow: "hidden",
        WebkitLineClamp: 2,
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
      }}
    >
      {title}
    </Link>
  );

  const renderCover = (
    <Box
      component="img"
      alt={title}
      src={imgUrl}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: "cover",
        position: "absolute",
      }}
    />
  );

  const renderDate = (
    <Typography
      variant="h6"
      component="div"
      sx={{
        mb: 2,
        color: "text.disabled",
      }}
    >
      {covertDateTime(startTime)}
    </Typography>
  );

  const renderShape = (
    <SvgColor
      color="paper"
      src="/shape-avatar.svg"
      sx={{
        width: 80,
        height: 36,
        zIndex: 9,
        bottom: -15,
        position: "absolute",
        color: "background.paper",
      }}
    />
  );

  return (
    <Card>
      <Box
        sx={{
          position: "relative",
          pt: "calc(100% * 3 / 4)",
        }}
      >
        {renderShape}

        {renderAvatar}

        {renderCover}
      </Box>

      <Box
        sx={{
          p: (theme) => theme.spacing(4, 3, 3, 3),
        }}
      >
        {renderDate}

        {renderTitle}
      </Box>
    </Card>
  );
}
