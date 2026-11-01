using System;
using System.IO;
using System.Diagnostics;
using System.Windows.Forms;
class Launcher {
 [STAThread] static void Main(){
  try{
   string script=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"tools","windows-launch.ps1");
   if(!File.Exists(script))throw new Exception("Thiếu bộ chạy. Hãy chọn Reinstall trong trình cài đặt.");
   Process.Start(new ProcessStartInfo(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows),"System32","WindowsPowerShell","v1.0","powershell.exe"),"-NoProfile -ExecutionPolicy Bypass -File \""+script+"\""){UseShellExecute=false,CreateNoWindow=true,WindowStyle=ProcessWindowStyle.Hidden});
  }catch(Exception e){MessageBox.Show(e.Message,"Codex Animation",MessageBoxButtons.OK,MessageBoxIcon.Error);}
 }
}
