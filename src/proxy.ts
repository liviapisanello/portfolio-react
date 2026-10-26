import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { dashboardRedirect } from "@/lib/auth-guard";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/dashboard/login") return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.redirect(new URL("/dashboard/login?setup=supabase", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error("Não foi possível verificar a sessão do painel.", error.message);

  const redirect = dashboardRedirect(
    Boolean(user),
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return redirect ? NextResponse.redirect(new URL(redirect, request.url)) : response;
}

export const config = { matcher: ["/dashboard/:path*"] };
