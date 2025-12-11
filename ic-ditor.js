/* icDitor  – iclassic
 * Version: 1.0.12-A-Final
 * Author: Iman Yazdani Charati (iClassic Team)
 */

(function(){

    class icDitor  {
        constructor(sel="textarea[data-editor]"){
            document.addEventListener("DOMContentLoaded",()=>{
                document.querySelectorAll(sel).forEach(t=>this.build(t));
            });
        }
    
        build(textarea){
            const id="ted-"+Math.random().toString(36).slice(2);
            textarea.dataset.tedId=id;
            textarea.style.display="none";
    
            const wrap=this.el("div","ted-wrap",
                "direction:rtl;text-align:right;border:1px solid #ccc;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;max-width:100%;font-family:tahoma;position:relative;");
    
            const bar=this.toolbar(textarea);
            const float=this.floatingToolbar();
            const editor=this.editor(textarea);
            const preview=this.preview();
            const footer=this.footer(textarea);
    
            wrap.appendChild(bar);
            wrap.appendChild(float);
            wrap.appendChild(editor);
            wrap.appendChild(preview);
            wrap.appendChild(footer);
    
            textarea.parentNode.insertBefore(wrap,textarea);
            wrap.appendChild(textarea);
    
            this.events({editor,textarea,preview,footer,wrap,float});
            this.restore(textarea,editor);
            this.updateCounter(editor,textarea,footer);
        }
    
        toolbar(textarea){
            const bar=this.el("div","ted-bar",
                "padding:8px;direction:rtl;text-align:right;display:flex;flex-wrap:wrap;gap:6px;border-bottom:1px solid #eee;background:#fafafa;");
    
            const userFonts=(textarea.dataset.fonts||"").split(",").map(f=>f.trim()).filter(f=>f);
            const defaultFonts=["Tahoma","Arial","Yekan","Vazir","IRANSans","sans-serif"];
            const finalFonts=[...new Set(["Tahoma",...userFonts,...defaultFonts])];
    
            const fontSel=this.el("select","ted-fontsel","padding:4px;border:1px solid #ccc;border-radius:4px;font-size:13px;");
            fontSel.title="انتخاب فونت";
            finalFonts.forEach(f=>{
                const o=document.createElement("option");
                o.value=f;o.textContent=f;fontSel.appendChild(o);
            });
            fontSel.onchange=()=>document.execCommand("fontName",false,fontSel.value);
            bar.appendChild(fontSel);
    
            const sizeSel=this.el("select","ted-sizesel","padding:4px;border:1px solid #ccc;border-radius:4px;font-size:13px;");
            sizeSel.title="اندازه فونت";
            [10,12,14,16,18,20,24,32].forEach(s=>{
                const o=document.createElement("option");
                o.value=s;o.textContent=s+"px";sizeSel.appendChild(o);
            });
            sizeSel.onchange=()=>document.execCommand("fontSize",false,"7");
            sizeSel.onblur=()=>{
                document.querySelectorAll("font[size='7']").forEach(f=>{
                    f.removeAttribute("size");
                    f.style.fontSize=sizeSel.value+"px";
                });
            };
            bar.appendChild(sizeSel);
    
            const mkBtn=(icon,title,cmd,arg)=>{
                const b=this.el("button","ted-btn","padding:4px 8px;border:1px solid #ccc;background:#fff;border-radius:4px;cursor:pointer;font-size:14px;");
                b.textContent=icon;
                b.title=title;
                b.onclick=()=>this.command(cmd,arg);
                return b;
            };
    
            const btns=[
                ["𝐁","پررنگ","bold"],
                ["𝑖","کج","italic"],
                ["U̲","خط زیر","underline"],
    
                ["𝐇1","هدینگ ۱","_heading","h1"],
                ["𝐇2","هدینگ ۲","_heading","h2"],
                ["𝐇3","هدینگ ۳","_heading","h3"],
    
                ["•⟲","لیست مرتب","insertOrderedList"],
                ["•","لیست نامرتب","insertUnorderedList"],
    
                ["⬅️","چپ‌چین","_left"],
                ["↔️","وسط‌چین","_center"],
                ["➡️","راست‌چین","_right"],
    
                ["RTL","راست‌به‌چپ","_rtl"],
                ["LTR","چپ‌به‌راست","_ltr"],
    
                ["🎨","رنگ متن","_colorui"],
                ["🖌","رنگ پس‌زمینه","_bgui"],
    
                ["🔗","درج لینک","_link"],
                ["⛔","حذف لینک","_unlink"],
    
                ["▦","درج جدول","_table"],
                ["🧩","درج iframe","_iframe"],
    
                ["🧹","پاکسازی","_clean"],
    
                ["👁","پیش‌نمایش","_preview"],
                ["🖵","تمام‌صفحه","_fullscreen"],
                ["<>","سورس","_source"],
    
                ["⟳","redo","redo"],
                ["⟲","undo","undo"],
            ];
    
            btns.forEach(b=>bar.appendChild(mkBtn(...b)));
            return bar;
        }
    
        floatingToolbar(){
            const f=this.el("div","ted-float",
                "position:absolute;display:none;direction:rtl;text-align:right;background:#fff;padding:6px;border:1px solid #ccc;z-index:50;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.15);");
    
            const mk=(t,cmd)=>{const b=document.createElement("button");b.textContent=t;b.style.cssText="margin:0 3px;padding:3px 6px;border:1px solid #ccc;background:#fff;border-radius:4px;";b.onclick=e=>{e.preventDefault();e.stopPropagation();this.command(cmd);};return b;};
            f.appendChild(mk("𝐁","bold"));
            f.appendChild(mk("𝑖","italic"));
            f.appendChild(mk("U̲","underline"));
            f.appendChild(mk("🔗","_link"));
            return f;
        }
    
        getBlock(){
            const n=window.getSelection().anchorNode;
            return n?.closest ? n.closest("p,div,h1,h2,h3") : n?.parentNode;
        }
    
        command(cmd,arg){
            if(cmd==="_left"){document.execCommand("justifyLeft");return;}
            if(cmd==="_center"){document.execCommand("justifyCenter");return;}
            if(cmd==="_right"){document.execCommand("justifyRight");return;}
    
            if(cmd==="_rtl"){const b=this.getBlock();if(b){b.style.direction="rtl";b.style.textAlign="right";}return;}
            if(cmd==="_ltr"){const b=this.getBlock();if(b){b.style.direction="ltr";b.style.textAlign="left";}return;}
    
            if(cmd==="_heading"){
                const b=this.getBlock();
                if(!b){document.execCommand("formatBlock",false,arg);return;}
    
                const isSame = b.tagName.toLowerCase() === arg.toLowerCase();
                if(isSame){
                    document.execCommand("formatBlock",false,"p");
                } else {
                    document.execCommand("formatBlock",false,arg);
                }
                return;
            }
    
            if(cmd==="_colorui"){this.colorPicker(v=>document.execCommand("foreColor",false,v));return;}
            if(cmd==="_bgui"){this.colorPicker(v=>document.execCommand("hiliteColor",false,v));return;}
    
            if(cmd==="_link"){const u=prompt("لینک:");if(u)document.execCommand("createLink",false,u);return;}
            if(cmd==="_unlink"){document.execCommand("unlink");return;}
    
            if(cmd==="_table"){
                const r=+prompt("ردیف:",2)||2;
                const c=+prompt("ستون:",2)||2;
                let h="<table style='border-collapse:collapse;width:100%;margin:10px 0;'>";
                for(let i=0;i<r;i++){
                    h+="<tr>";
                    for(let j=0;j<c;j++)h+="<td style='border:1px solid #ccc;padding:6px;'>&nbsp;</td>";
                    h+="</tr>";
                }
                h+="</table>";
                document.execCommand("insertHTML",false,h);
                return;
            }
    
            if(cmd==="_iframe"){
                const u=prompt("آدرس iframe:");
                if(u)document.execCommand("insertHTML",false,`<iframe src="${u}" style="width:100%;height:300px;" frameborder="0"></iframe>`);
                return;
            }
    
            if(cmd==="_clean"){
                document.execCommand("removeFormat");
                return;
            }
    
            if(cmd==="_preview"){
                document.querySelector(".ted-preview").classList.toggle("ted-show");
                return;
            }
    
            if(cmd==="_fullscreen"){
                document.querySelector(".ted-wrap").classList.toggle("ted-fullscreen");
                return;
            }
    
            if(cmd==="_source"){
                const e=document.querySelector(".ted-editor");
                if(!e.dataset.source){
                    e.dataset.source="true";
                    e.textContent=e.innerHTML;
                    e.classList.add("ted-code");
                } else {
                    e.removeAttribute("data-source");
                    e.classList.remove("ted-code");
                    e.innerHTML=e.textContent;
                }
                return;
            }
    
            document.execCommand(cmd,false,arg||null);
        }
    
        colorPicker(cb){
            const ui=this.el("input","ted-color","position:fixed;top:20px;left:20px;z-index:99999;");
            ui.type="color";
            ui.oninput=()=>cb(ui.value);
            ui.click();
            setTimeout(()=>ui.remove(),3000);
        }
    
        editor(textarea){
            const e=this.el("div","ted-editor","padding:15px;direction:rtl;text-align:right;min-height:300px;font-family:tahoma;outline:none;");
            e.contentEditable="true";
            e.innerHTML=textarea.value||"<p><br></p>";
            return e;
        }
    
        preview(){
            return this.el("div","ted-preview","display:none;padding:15px;background:#fff;border-top:1px solid #ddd;");
        }
    
        footer(textarea){
            const f=this.el("div","ted-footer","padding:6px 12px;font-size:12px;background:#fafafa;border-top:1px solid #eee;text-align:right;");
            if(textarea.dataset.count==="true") f.textContent="کاراکتر: 0 | خط: 1";
            return f;
        }
    
        autosave(t,e){
            if(!e.dataset.source)
                localStorage.setItem("TED-"+t.dataset.tedId,e.innerHTML);
        }
    
        restore(t,e){
            const v=localStorage.getItem("TED-"+t.dataset.tedId);
            if(v)e.innerHTML=v;
        }
    
        updateCounter(editor,textarea,footer){
            if(textarea.dataset.count==="true"){
                let txt = editor.innerText.replace(/\n+$/,"");
                const chars = txt.length;
                const lines = txt ? txt.split(/\n/).length : 1;
                footer.textContent=`کاراکتر: ${chars} | خط: ${lines}`;
            }
        }
    
        events({editor,textarea,preview,footer,wrap,float}){
    
            const sync=()=>{
                if(editor.dataset.source) return;
                textarea.value=editor.innerHTML;
                preview.innerHTML=editor.innerHTML;
                this.autosave(textarea,editor);
                this.updateCounter(editor,textarea,footer);
            };
    
            /* ENTER FIX */
            editor.addEventListener("keydown",e=>{
                if(e.key==="Enter"){
                    e.preventDefault();
                    if(!e.shiftKey){
                        document.execCommand("insertHTML",false,"<br>");
                    } else {
                        document.execCommand("insertHTML",false,"<div><br></div>");
                    }
                    return;
                }
            });
    
            editor.addEventListener("paste",e=>{
                e.preventDefault();
                const t=(e.clipboardData||window.clipboardData).getData("text/plain");
                document.execCommand("insertText",false,t);
            });
    
            editor.addEventListener("mouseup",()=>{
                const s=window.getSelection();
                if(!s||!s.toString()){float.style.display="none";return;}
    
                const r=s.getRangeAt(0).getBoundingClientRect();
                float.style.top=(r.top+scrollY-110)+"px";
                float.style.left=((r.right+scrollX-140)<0 ? 10 : (r.right+scrollX-140))+"px";
                float.style.display="block";
            });
    
            document.addEventListener("scroll",()=>float.style.display="none");
    
            editor.addEventListener("input",sync);
            editor.addEventListener("keyup",sync);
            editor.addEventListener("blur",sync);
        }
    
        el(t,c,s){
            const x=document.createElement(t);
            if(c)x.className=c;
            if(s)x.style.cssText=s;
            return x;
        }
    }
    
    /* CSS */
    const st=document.createElement("style");
    st.textContent=`
    .ted-wrap.ted-fullscreen{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;background:#fff;border-radius:0;display:flex;flex-direction:column;direction:rtl;}
    .ted-preview.ted-show{display:block!important;}
    .ted-code{white-space:pre-wrap;font-family:consolas,monospace;background:#f6f6f6;border:1px solid #ddd;padding:10px;}
    .ted-float button:hover{background:#f0f0f0;}
    `;
    document.head.append(st);
    
    new icDitor ();
    
    })();
    