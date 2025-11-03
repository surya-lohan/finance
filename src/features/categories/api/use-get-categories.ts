
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCategories = () => {
    const query = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await client.api.categories.$get()

            if (!response.ok) {
                throw new Error("Failed to fetch categories")
            }

            const {categories} = await response.json();

            return categories;
        }
    })
    return query;
}
