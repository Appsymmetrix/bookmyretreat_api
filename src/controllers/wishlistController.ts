import { Request, Response } from "express";
import { Types } from "mongoose";
import Wishlist, { IWishlist } from "../models/Wishlist";
import Retreat, { IRetreat } from "../models/RetreatModal";
import { Blog, IBlog } from "../models/Blog";

interface GroupedItems {
  serviceType: string;
  data: Array<{ serviceId: Types.ObjectId }>;
}

const populateWishlistItemsByServiceType = async (
  wishlist: IWishlist,
  serviceType: string
): Promise<GroupedItems[]> => {
  const groupedItems: Record<string, GroupedItems> = {};

  const filteredItems = wishlist.items.filter(
    (item) => item.serviceType === serviceType
  );

  for (let item of filteredItems) {
    let model;
    switch (item.serviceType) {
      case "Retreat":
        model = Retreat;
        break;
      case "Blog":
        model = Blog;
        break;
      default:
        continue;
    }

    const serviceId = new Types.ObjectId(item.serviceId);

    try {
      //@ts-ignore
      const service = (await model.findById(serviceId).exec()) as
        | IBlog
        | IRetreat
        | null;

      if (service) {
        if (!groupedItems[item.serviceType]) {
          groupedItems[item.serviceType] = {
            serviceType: item.serviceType,
            data: [],
          };
        }
        groupedItems[item.serviceType].data.push({ serviceId });
      }
    } catch (error) {
      console.error(
        `Error fetching ${item.serviceType} with ID ${item.serviceId}`,
        error
      );
    }
  }

  return Object.values(groupedItems);
};

export const createOrUpdateWishlist = async (
  req: Request<{ userId: string }, {}, IWishlist>,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const wishlistData = req.body;

  try {
    let wishlist = await Wishlist.findOne({ userId }).exec();

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: wishlistData.items });
      await wishlist.save();
      return res.status(201).json(wishlist);
    } else {
      wishlist.items = wishlistData.items;
      await wishlist.save();
      return res.status(200).json(wishlist);
    }
  } catch (err) {
    console.error("Error creating/updating wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while creating/updating wishlist.",
    });
  }
};

export const getWishlistByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId })
      .populate({
        path: "items.serviceId",
        model: "Retreat",
      })
      .exec();

    if (!wishlist) {
      return res.status(200).json([]);
    }

    const populatedWishlist = wishlist.items.map((item: any) => {
      if (item.serviceType === "Retreat" && item.serviceId) {
        item.serviceData = item.serviceId || {};
      } else {
        item.serviceData = null;
      }
      return item;
    });

    return res.status(200).json(populatedWishlist);
  } catch (error) {
    console.error("Failed to retrieve wishlist", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve wishlist", error });
  }
};

export const getWishlistByServiceType = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId, serviceType } = req.params;

  try {
    let wishlist = await Wishlist.findOne({ userId }).exec();

    if (!wishlist) {
      return res.status(200).json([]);
    }

    const populatedWishlist = await populateWishlistItemsByServiceType(
      wishlist,
      serviceType
    );

    return res.status(200).json(populatedWishlist);
  } catch (err) {
    console.error("Error retrieving wishlist by serviceType:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching wishlist by serviceType.",
    });
  }
};

export const addToWishlist = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { serviceType, serviceId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ userId }).exec();

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [{ serviceType, serviceId }] });
      await wishlist.save();
      return res.status(201).json(wishlist);
    } else {
      const existingItem = wishlist.items.find(
        (item) =>
          item.serviceType === serviceType &&
          item.serviceId.toString() === serviceId.toString()
      );

      if (existingItem) {
        return res.status(400).json({ message: "Item already in wishlist." });
      }

      wishlist.items.push({ serviceType, serviceId });
      await wishlist.save();

      return res.status(200).json(wishlist);
    }
  } catch (err) {
    console.error("Error adding item to wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while adding item to wishlist.",
    });
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId, serviceType, serviceId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId }).exec();

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    const index = wishlist.items.findIndex(
      (item) =>
        item.serviceType === serviceType &&
        item.serviceId.toString() === serviceId
    );

    if (index === -1) {
      return res.status(404).json({ message: "Item not found in wishlist." });
    }

    wishlist.items.splice(index, 1);
    await wishlist.save();

    return res.status(200).json(wishlist);
  } catch (err) {
    console.error("Error removing item from wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while removing item from wishlist.",
    });
  }
};

export const clearWishlist = async (
  req: Request<{ userId: string }, {}, {}>,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId }).exec();

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    wishlist.items = [];
    await wishlist.save();

    return res.status(200).json({ message: "Wishlist cleared successfully." });
  } catch (err) {
    console.error("Error clearing wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while clearing wishlist.",
    });
  }
};
