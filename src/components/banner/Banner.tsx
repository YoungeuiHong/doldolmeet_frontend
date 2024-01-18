import React from "react";
import Carousel from "react-material-ui-carousel";
import Image from "next/image";
import banner_img from "/public/newjeans_banner.png";

const imageUrls: string[] = ["/newjeans_banner.png"];
export default function Banner() {
  return (
    <Carousel sx={{ height: 350 }}>
      {imageUrls.map((url, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center" }}>
          <Image src={banner_img} alt={"banner"} height={350} priority={true} />
        </div>
      ))}
    </Carousel>
  );
}
