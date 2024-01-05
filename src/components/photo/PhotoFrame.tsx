import { Grid, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";

interface Props {
  idolImgSrc: string;
  fanImgSrc: string;
}

const PhotoFrame = ({ idolImgSrc, fanImgSrc }: Props) => {
  return (
    <Grid
      id={"photo-frame"}
      container
      direction={"row"}
      alignItems={"center"}
      justifyContent={"center"}
      sx={{
        backgroundColor: "#000000",
        padding: 2,
        display: "none",
      }}
    >
      <Grid item xs={12}>
        <Typography
          variant={"h1"}
          sx={{ color: "#FFFFFF", marginBottom: 1, fontFamily: "Arial" }}
        >
          DOLDOLMEET FILM
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={1} direction={"row"}>
          <img
            src={idolImgSrc}
            alt="idol-img"
            style={{
              width: "auto",
              objectFit: "cover",
            }}
          />
          <img
            src={fanImgSrc}
            alt="fan-img"
            style={{
              width: "auto",
              objectFit: "cover",
            }}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default PhotoFrame;
