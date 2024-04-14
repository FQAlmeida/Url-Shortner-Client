import { get, writable } from "svelte/store";
import { session } from "./auth";
import { SERVER_HOST } from "$lib/consts";

export type Slug = {
    id: string;
    slug: string;
    redirect: string;
};

export const error = writable<any>(null);

const create_slugs_store = async () => {
    const { update, subscribe, set } = writable<Slug[]>([]);

    const reset_slugs = async () => {
        const uri = new URL(`${SERVER_HOST}/slugs`);
        const userid = get(session).user?.uid;
        if (!userid) {
            return;
        }
        uri.searchParams.append("userid", userid);
        const response = await fetch(uri, { mode: "cors" });
        const slugs: Slug[] = await response.json();
        if (!Array.isArray(slugs)) {
            error.set(JSON.stringify(slugs));
            return;
        }
        set(slugs);
    };

    session.subscribe((s) => {
        if (!!s.user) {
            reset_slugs();
        }
    });

    const add_slug = async (slug: Omit<Slug, "id">) => {
        const uri = new URL(`${SERVER_HOST}/slugs`);
        uri.searchParams.append("userid", get(session).user?.uid ?? "-1");
        const response = await fetch(uri, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ ...slug, uid: get(session).user?.uid ?? "-1" }), // body data type must match "Content-Type" header
        });
        const slug_set: Slug = await response.json();
        if (response.status > 300) {
            error.set(JSON.stringify(slug_set));
            return;
        }
        update((old) => {
            return [...old, slug_set];
        });
    };

    const update_slug = async (slug: Slug) => {
        const uri = new URL(`${SERVER_HOST}/slugs`);
        const response = await fetch(uri, {
            method: "PUT", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ ...slug, uid: get(session).user?.uid ?? "-1" }), // body data type must match "Content-Type" header
        });
        if (response.status > 300) {
            const err: Slug = await response.json();
            error.set(JSON.stringify(err));
            return;
        }
        update((old) => {
            return old.map((s) => s.id === slug.id ? slug : s);
        });
    };

    const remove_slug = async (id: string) => {
        const uri = new URL(`${SERVER_HOST}/slugs`);
        uri.searchParams.append("userid", get(session).user?.uid ?? "-1");
        uri.searchParams.append("id", id);
        const response = await fetch(uri, {
            method: "DELETE", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        });
        if (response.status > 300) {
            const err: Slug = await response.json();
            error.set(JSON.stringify(err));
            return;
        }
        update((old) => {
            return old.filter((slug) => slug.id !== id);
        });
    };
    await reset_slugs();
    return {
        set, update, subscribe,
        add_slug,
        update_slug,
        remove_slug,
        reset_slugs
    };
};

export const slugs = await create_slugs_store();
