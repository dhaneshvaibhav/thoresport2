import { createClient } from "@supabase/supabase-js";

export const supabase = createClient("https://ltsombfuwcalqigfxccd.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0c29tYmZ1d2NhbHFpZ2Z4Y2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTk0MDUsImV4cCI6MjA2Njg3NTQwNX0.FzNBXrbO1HrBMVZVkuLi_8JFI37AoEIpl8LhASRR5As");