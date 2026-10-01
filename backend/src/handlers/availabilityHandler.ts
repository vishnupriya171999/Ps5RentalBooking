import type { Request, Response } from 'express';
import * as availabilityDao from "../dao/availabilityDao.js";

export const getAllConsoles = async (req: Request, res: Response) => {
  try {
    const consoles = await availabilityDao.getAllConsoles();

    return res.status(200).json({
      success: true,
      message: "Consoles fetched successfully",
      data: consoles,
    });
  } catch (error) {
    console.error("Get consoles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch consoles",
    });
  }
};
