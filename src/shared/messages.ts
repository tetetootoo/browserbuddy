export type GlanceMessage = {
  type: "SELECTION_CAPTURED";
  text: string;
};

export type GlanceResponse = {
  type: "ACK";
  receivedAt: number;
};
