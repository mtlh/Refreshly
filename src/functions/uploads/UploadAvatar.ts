import server$ from "solid-start/server";
import { supabase } from "../supabase";

export const UploadAvatar = server$(async (file: any) => {

    const listbuckets = await supabase
    .storage
    .listBuckets();

    console.log(listbuckets.data);

    return listbuckets.data;
});