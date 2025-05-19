import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST() {
  try {
    // Clerk에서 현재 인증된 사용자 정보 가져오기
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    // 사용자 정보 Supabase에 저장
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        username: user.username || user.firstName,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Supabase 오류:", error);
      return NextResponse.json(
        { error: "사용자 정보 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 