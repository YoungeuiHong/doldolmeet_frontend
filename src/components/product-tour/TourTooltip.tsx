import { Box, Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import type { TooltipRenderProps } from "react-joyride/src/types/components";

export default function TourTooltip({
  step,
  index,
  continuous,
  backProps,
  primaryProps,
  closeProps,
}: TooltipRenderProps) {
  return (
    <Stack
      direction={"column"}
      sx={{ backgroundColor: "#FFFFFF", borderRadius: 2, p: 2 }}
      spacing={1}
    >
      <Box sx={{ py: 3, px: 1 }}>
        <Typography sx={{ textAlign: "center", fontSize: 15 }}>
          {step.content}
        </Typography>
      </Box>
      <Stack
        direction={"row"}
        justifyContent={index === 0 ? "flex-end" : "space-between"}
      >
        {index > 0 && (
          <Button {...backProps} variant={"outlined"}>
            Back
          </Button>
        )}
        {!step.hideFooter && continuous && (
          <Button {...primaryProps} variant={"contained"}>
            Next
          </Button>
        )}
        {!step.hideFooter && !continuous && (
          <Button {...closeProps}>Close</Button>
        )}
        {step.hideFooter && step.title && (
          <Button
            {...primaryProps}
            onClick={() => (window.location.href = step.title)}
            variant={"contained"}
          >
            Next
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
