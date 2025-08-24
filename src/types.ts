import z from "zod";

export namespace MCPServerTypes {
  export interface ToolDefinition {
    definition: {
      function: {
        name: string;
        description: string;
        parameters: z.ZodObject<any>;
      };
    };
    function: (args: any) => Promise<any>;
  }
}
