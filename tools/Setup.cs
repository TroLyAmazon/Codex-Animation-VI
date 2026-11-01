using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using Microsoft.Win32;
class Setup:Form {
 const string Key="Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\CodexAnimationVN";
 static readonly string Target=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"CodexAnimationVN");
 Label status=new Label(); Button install=new Button(),reinstall=new Button(),uninstall=new Button();
 public Setup(){
  Icon=Icon.ExtractAssociatedIcon(Assembly.GetExecutingAssembly().Location);
  Text="Codex Animation — Cài đặt";Size=new Size(540,300);FormBorderStyle=FormBorderStyle.FixedDialog;MaximizeBox=false;StartPosition=FormStartPosition.CenterScreen;Font=new Font("Segoe UI",10);
  var title=new Label(){Text="Codex Animation",Font=new Font("Segoe UI",20,FontStyle.Bold),Location=new Point(24,20),AutoSize=true};Controls.Add(title);
  status.SetBounds(26,78,475,65);Controls.Add(status);
  install.Text="Install";reinstall.Text="Reinstall";uninstall.Text="Uninstall";
  int x=26;foreach(var b in new[]{install,reinstall,uninstall}){b.SetBounds(x,155,145,42);Controls.Add(b);x+=158;}
  install.Click+=(s,e)=>Run(()=>Install(false));reinstall.Click+=(s,e)=>Run(()=>Install(true));uninstall.Click+=(s,e)=>Run(Uninstall);
  Controls.Add(new Label(){Text="Cài cho tài khoản hiện tại • Không cần quyền quản trị",Location=new Point(26,220),AutoSize=true});RefreshState();
 }
 void RefreshState(){
  bool exists=Directory.Exists(Target);using(var k=Registry.CurrentUser.OpenSubKey(Key)){exists=exists||k!=null;}
  install.Visible=!exists;reinstall.Visible=true;uninstall.Visible=true;
  install.Enabled=!exists;reinstall.Enabled=exists;uninstall.Enabled=exists;
  reinstall.Left=exists?26:184;uninstall.Left=exists?184:342;
  status.Text=(exists?"Đã có bản cài trên máy. Reinstall để cài lại hoặc cập nhật.":"Chưa cài. Nhấn Install để bắt đầu.")+"\n"+Target;
 }
 void Run(Action action){try{foreach(var b in new[]{install,reinstall,uninstall})b.Enabled=false;action();}catch(Exception e){MessageBox.Show(e.Message,Text,MessageBoxButtons.OK,MessageBoxIcon.Error);}finally{RefreshState();}}
 static void SafeDelete(string p){string full=Path.GetFullPath(p);if(full!=Target&&full!=Target+".staging"&&full!=Target+".backup")throw new Exception("Thư mục xóa không hợp lệ.");if(Directory.Exists(full)){if((File.GetAttributes(full)&FileAttributes.ReparsePoint)!=0)throw new Exception("Không xử lý thư mục liên kết.");foreach(var d in Directory.GetDirectories(full,"*",SearchOption.AllDirectories))if((File.GetAttributes(d)&FileAttributes.ReparsePoint)!=0)throw new Exception("Có liên kết trong thư mục cài đặt.");Directory.Delete(full,true);}}
 static void PowerShell(string source){
  var p=Process.Start(new ProcessStartInfo(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows),"System32","WindowsPowerShell","v1.0","powershell.exe"),"-NoProfile -NonInteractive -EncodedCommand "+Convert.ToBase64String(System.Text.Encoding.Unicode.GetBytes(source))){UseShellExecute=false,CreateNoWindow=true,RedirectStandardError=true});string error=p.StandardError.ReadToEnd();p.WaitForExit();if(p.ExitCode!=0)throw new Exception(error);
 }
 static string Quote(string s){return "'"+s.Replace("'","''")+"'";}
 static void Shortcuts(bool remove){
  foreach(var folder in new[]{Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),Environment.GetFolderPath(Environment.SpecialFolder.Programs)}){
   string link=Path.Combine(folder,"Codex Animation.lnk");
   if(remove){if(File.Exists(link))PowerShell("$s=New-Object -ComObject WScript.Shell;$l=$s.CreateShortcut("+Quote(link)+");if($l.TargetPath -eq "+Quote(Path.Combine(Target,"Codex Animation.exe"))+"){Remove-Item -LiteralPath "+Quote(link)+"}");}
   else PowerShell("$s=New-Object -ComObject WScript.Shell;$l=$s.CreateShortcut("+Quote(link)+");$l.TargetPath="+Quote(Path.Combine(Target,"Codex Animation.exe"))+";$l.WorkingDirectory="+Quote(Target)+";$l.Description='Hoạt ảnh và nền Codex';$l.Save()");
  }
 }
 void Install(bool replace){
  PowerShell("if(-not(Get-AppxPackage -Name OpenAI.Codex)){Write-Error 'Hãy cài Codex / ChatGPT chính thức trước.';exit 1}");
  string staging=Target+".staging",backup=Target+".backup";SafeDelete(staging);SafeDelete(backup);Directory.CreateDirectory(staging);
  using(var stream=Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip"))using(var zip=new ZipArchive(stream,ZipArchiveMode.Read)){
   foreach(var entry in zip.Entries){string path=Path.GetFullPath(Path.Combine(staging,entry.FullName.Replace('/',Path.DirectorySeparatorChar)));if(!path.StartsWith(staging+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase))throw new Exception("Đường dẫn trong gói không hợp lệ.");Directory.CreateDirectory(Path.GetDirectoryName(path));if(entry.Name.Length>0)entry.ExtractToFile(path,true);}
  }
  File.Copy(Assembly.GetExecutingAssembly().Location,Path.Combine(staging,"Codex Animation Setup.exe"),true);
  if(Directory.Exists(Target))Directory.Move(Target,backup);
  try{Directory.Move(staging,Target);Shortcuts(false);using(var k=Registry.CurrentUser.CreateSubKey(Key)){
   k.SetValue("DisplayName","Codex Animation");k.SetValue("DisplayVersion","1.0.0");k.SetValue("InstallLocation",Target);k.SetValue("DisplayIcon",Path.Combine(Target,"Codex Animation.exe"));k.SetValue("UninstallString","\""+Path.Combine(Target,"Codex Animation Setup.exe")+"\" --manage");k.SetValue("NoModify",1);k.SetValue("NoRepair",1);
  }}catch{SafeDelete(Target);if(Directory.Exists(backup))Directory.Move(backup,Target);throw;}
  SafeDelete(backup);MessageBox.Show("Đã cài xong. Mở Codex Animation trên Desktop.\nNếu Codex đang chạy, hãy thoát hoàn toàn rồi mở bằng lối tắt mới.",Text);
 }
 void Uninstall(){
  if(MessageBox.Show("Gỡ Codex Animation khỏi máy? Ảnh/video đã lưu trong Codex vẫn được giữ.\nThoát Codex rồi mở bằng biểu tượng gốc để bỏ nền hiện tại.",Text,MessageBoxButtons.YesNo,MessageBoxIcon.Question)!=DialogResult.Yes)return;
  Shortcuts(true);SafeDelete(Target);Registry.CurrentUser.DeleteSubKeyTree(Key,false);MessageBox.Show("Đã gỡ Codex Animation.",Text);
 }
 [STAThread] static void Main(string[] args){
  if(args.Length>0&&args[0]=="--verify"){
   using(var s=Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip"))using(var z=new ZipArchive(s,ZipArchiveMode.Read)){foreach(string name in new[]{"Codex Animation.exe","runtime/node.exe","video/Start/codex_edited.mp4","video/wallpaper/girl_only_dark_blue_wallpaper.mp4"})if(z.GetEntry(name)==null)Environment.Exit(2);}return;
  }
  if(Path.GetFullPath(Assembly.GetExecutingAssembly().Location).StartsWith(Target+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase)){
   string temp=Path.Combine(Path.GetTempPath(),"CodexAnimationSetup-"+Guid.NewGuid()+".exe");File.Copy(Assembly.GetExecutingAssembly().Location,temp);Process.Start(temp,"--manage");return;
  }
  Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);Application.Run(new Setup());
 }
}
