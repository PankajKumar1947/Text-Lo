import ApiError from "../common/utils/api-error.js"
import { Store } from "./store.model.js";

const isSlugExist = async (slug: string): Promise<boolean> => {
  console.log("slug", slug);
  const findSlug = await Store.findOne({ slug });
  console.log("find slug", slug)
  return findSlug ? true : false;
}

const createSlug = async (slug: string): Promise<{ slug: string }> => {
  if (await isSlugExist(slug)) {
    throw ApiError.conflict("Slug Already Exist");
  }

  const slugCreated = await Store.create({ slug });
  return { slug: slugCreated.slug }
}

const updateStoreContent = async (slug: string, content: string) => {
  const store = await Store.findOneAndUpdate(
    { slug },
    { content },
    { returnDocument: 'after', upsert: true }
  );
  return store;
}

const getStoreContent = async (slug: string): Promise<string> => {
  const store = await Store.findOne({ slug }).select("content").lean();
  return store?.content || "";
}

export { isSlugExist, createSlug, updateStoreContent, getStoreContent };