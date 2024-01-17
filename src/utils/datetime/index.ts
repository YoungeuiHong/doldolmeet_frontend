export const covertDateTime = (datetime: string) => {
  const parsedDate = new Date(datetime);
  return `${parsedDate.getFullYear()}.${(parsedDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${parsedDate
    .getDate()
    .toString()
    .padStart(2, "0")} ${parsedDate
    .getHours()
    .toString()
    .padStart(2, "0")}:${parsedDate.getMinutes().toString().padStart(2, "0")}`;
};
