// テーマパック: Java Silver の謎（tools/build-java.js で生成 2026-10-27）
registerTheme({
  "id": "javasilver",
  "title": "Java Silver の謎",
  "icon": "☕",
  "color": "#e76f00",
  "tagline": "そのコード、本当にコンパイルが通る？",
  "intro": "Oracle 認定 Java Programmer, Silver（SE 17 は60問・90分・正答率65%で合格）。出題の多くは短いコードを読み、「何が出力されるか」「コンパイルが通るか」を見抜く問題だ。9つの分野を1つずつ攻略し、コンパイラの目を手に入れろ。",
  "mystery": "たった数行のコードの「ひっかけ」は、どうすれば見抜けるのか？",
  "chapters": [
    {
      "title": "データ型と変数・文字列",
      "icon": "🧱",
      "story": "Silver 試験は「このコードはコンパイルできるか」「何が出力されるか」を問う問題がほとんどだ。中でも型の範囲・リテラルの書き方・var の制限・String の不変性は、どの問題にも顔を出す土台になる。ここを曖昧にすると、ひっかけの「コンパイルエラー」を見抜けない。",
      "facts": [
        {
          "text": "int は32ビット、long は64ビット。整数リテラルの既定は int",
          "detail": "2147483648 のように int の範囲を超える数は、L を付けないとコンパイルエラーになる。小数リテラルの既定は double なので、float には f が必要。",
          "rarity": "N"
        },
        {
          "text": "数値リテラルの _ は数字と数字の間だけに書ける",
          "detail": "1_000_000 はOK。先頭（_100）・末尾（100_）・小数点の隣（1._5）・接頭辞の直後（0x_1F）はコンパイルエラー。_100 は数値ではなく変数名とみなされる。",
          "rarity": "R"
        },
        {
          "text": "var はローカル変数専用。フィールド・引数・戻り値には使えない",
          "detail": "初期化式から型を推論するので、var x; や var x = null; はコンパイルエラー。var a = 1, b = 2; のような複数宣言も不可。",
          "rarity": "SR"
        },
        {
          "text": "String は不変。メソッドは新しい文字列を返すだけ",
          "detail": "s.toUpperCase(); と書いても s 自身は変わらない。結果を使うには s = s.toUpperCase(); のように受け取る必要がある。",
          "rarity": "N"
        },
        {
          "text": "StringBuilder は可変で、equals は中身を比べない",
          "detail": "append や reverse は自分自身を書き換えて自分を返す。equals は Object のままなので、同じ中身でも別インスタンスなら false。",
          "rarity": "SR"
        },
        {
          "text": "byte b = 10; はOKでも、int i = 10; byte c = i; はコンパイルエラー",
          "detail": "範囲に収まる「定数式」だけは byte・short・char へ暗黙に縮小できる。変数 i は定数ではないのでキャストが必要。final int i = 10; なら通る。",
          "rarity": "SSR"
        }
      ],
      "questions": [
        {
          "type": "tf",
          "q": "このコードは true を出力する。",
          "code": "String s = \"a\" + \"b\";\nSystem.out.println(s == \"ab\");",
          "a": true,
          "explain": "\"a\" + \"b\" はコンパイル時に \"ab\" へ計算される定数式なので、文字列プールの同じオブジェクトを指す。変数を混ぜた連結は実行時に新しい String が作られ、== は false になる。"
        },
        {
          "type": "tf",
          "q": "このコードは true を出力する。",
          "code": "String a = \"a\";\nString s = a + \"b\";\nSystem.out.println(s == \"ab\");",
          "a": false,
          "explain": "a は final ではない変数なので、a + \"b\" は実行時に新しい String を作る。もし final String a = \"a\"; なら定数式になり true になる。"
        },
        {
          "type": "tf",
          "q": "long n = 2147483648; はコンパイルできる。",
          "a": false,
          "explain": "2147483648 は int の最大値を1超えるので、L のない int リテラルとして書けずコンパイルエラー。代入先が long でも、リテラル自体の型は int のまま判断される。"
        },
        {
          "type": "tf",
          "q": "float f = 1.5; はコンパイルできる。",
          "a": false,
          "explain": "1.5 は double リテラルで、double から float への縮小はキャストが要る。1.5f と書けばOK。なお float は32ビット、double は64ビット。"
        },
        {
          "type": "tf",
          "q": "char c = 65; はコンパイルできる。",
          "a": true,
          "explain": "65 は char の範囲（0〜65535）に収まる定数なので暗黙に代入できる。println(c) すると文字 A が表示される。"
        },
        {
          "type": "tf",
          "q": "var x = null; はコンパイルできる。",
          "a": false,
          "explain": "null からは型を推論できないのでコンパイルエラー。var は「型を書かなくてよい」だけで、型そのものはコンパイル時に決まる（動的型ではない）。"
        },
        {
          "type": "tf",
          "q": "var a = 1, b = 2; はコンパイルできる。",
          "a": false,
          "explain": "var は1つの宣言に1変数だけ。int a = 1, b = 2; なら問題ない。ちなみに var は予約語ではなく「予約された型名」なので、var という名前の変数は作れる。"
        },
        {
          "type": "tf",
          "q": "このコードは true を出力する。",
          "code": "var a = new StringBuilder(\"x\");\nvar b = new StringBuilder(\"x\");\nSystem.out.println(a.equals(b));",
          "a": false,
          "explain": "StringBuilder は equals をオーバーライドしていないので、別インスタンスなら false。中身を比べたいときは a.toString().equals(b.toString()) か、Java 11 で追加された a.compareTo(b) == 0 を使う。"
        },
        {
          "type": "tf",
          "q": "このコードは true を出力する。",
          "code": "System.out.println(\" \\t \".isBlank());",
          "a": true,
          "explain": "isBlank（Java 11〜）は空文字か、空白文字だけなら true。isEmpty は長さ0のときだけ true なので、この文字列では false になる。"
        },
        {
          "type": "tf",
          "q": "String s = \"\"\"abc\"\"\"; はコンパイルできる。",
          "a": false,
          "explain": "テキストブロックは開始の \"\"\" の直後に改行が必須なので、1行では書けずコンパイルエラー。終了の \"\"\" は文字の直後に置いてよい。"
        },
        {
          "type": "number",
          "q": "byte 型で表せる最大値は？",
          "a": 127,
          "unit": "",
          "min": 0,
          "max": 300,
          "explain": "byte は8ビットで -128〜127。最小値の絶対値のほうが1大きいのは、2の補数表現で0を正の側に含めるから。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "byte b = (byte) 200;\nSystem.out.println(b);",
          "a": -56,
          "unit": "",
          "min": -128,
          "max": 127,
          "explain": "200 を8ビットに切り詰めると 200 - 256 = -56。キャストは範囲外でも例外を出さず、上位ビットを黙って捨てる。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "var sb = new StringBuilder();\nSystem.out.println(sb.capacity());",
          "a": 16,
          "unit": "",
          "min": 0,
          "max": 50,
          "explain": "引数なしの StringBuilder の初期容量は16文字。new StringBuilder(\"ab\") なら 16 + 文字数 = 18 になる。容量は足りなくなると自動で増える。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "String s = \"Java Silver\";\nSystem.out.println(s.indexOf(\"a\", 2));",
          "a": 3,
          "unit": "",
          "min": -1,
          "max": 10,
          "explain": "位置2（v）から探し始めるので、最初の a（位置1）は飛ばして位置3が返る。見つからなければ -1。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int x = Integer.MAX_VALUE;\nx++;\nint min = Integer.MIN_VALUE;\nSystem.out.println(x == min);",
          "a": "true",
          "wrong": [
            "false",
            "コンパイルエラー",
            "実行時に例外がスローされる"
          ],
          "explain": "整数の演算はあふれても例外にならず、最大値の次は最小値に回り込む。あふれを例外にしたいときは Math.addExact などを使う。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "String s = \"Java\";\nSystem.out.println(s.substring(1, 3));",
          "a": "av",
          "wrong": [
            "ava",
            "Ja",
            "va"
          ],
          "explain": "substring(開始, 終了) は終了位置の文字を含まない。取り出す長さは「終了 - 開始」で計算できる（ここでは2文字）。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "String s = \"java\";\ns.toUpperCase();\nSystem.out.println(s);",
          "a": "java",
          "wrong": [
            "JAVA",
            "Java",
            "コンパイルエラー"
          ],
          "explain": "String は不変なので、戻り値を受け取らなければ s は変わらない。戻り値を捨てても警告もコンパイルエラーも出ないのがひっかけどころ。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "var sb = new StringBuilder(\"abc\");\nsb.insert(1, \"X\").append(\"Y\");\nSystem.out.println(sb);",
          "a": "aXbcY",
          "wrong": [
            "XabcY",
            "abXcY",
            "aXbc"
          ],
          "explain": "insert(1, \"X\") は位置1の前に挿入する。StringBuilder のメソッドは自分自身を返すので、このように数珠つなぎ（メソッドチェーン）で書ける。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "var sb = new StringBuilder(\"abcdef\");\nsb.delete(1, 3);\nSystem.out.println(sb);",
          "a": "adef",
          "wrong": [
            "aef",
            "cdef",
            "abef"
          ],
          "explain": "delete(1, 3) は位置1〜2（b と c）を消し、位置3は残す。終了位置が長さを超えても例外にならず、末尾までが消される。"
        },
        {
          "type": "choice",
          "q": "文字列の前後にある全角スペース（U+3000）を取り除けるのは？",
          "a": "strip() だけ",
          "wrong": [
            "trim() だけ",
            "strip() と trim() の両方",
            "どちらも取り除けない"
          ],
          "explain": "trim() は文字コード U+0020 以下だけを空白とみなす。Java 11 の strip() は Unicode の空白（Character.isWhitespace）を取り除くので全角スペースも消える。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "String s = \"banana\";\nSystem.out.println(s.replace('a', 'o'));",
          "a": "bonono",
          "wrong": [
            "bonana",
            "banano",
            "コンパイルエラー"
          ],
          "explain": "replace は一致するものを全部置き換える（最初の1つだけではない）。正規表現を使う replaceAll と違い、replace は文字どおりに置換する。"
        },
        {
          "type": "choice",
          "q": "このコードを実行するとどうなる？",
          "code": "String s = \"Java\";\nSystem.out.println(s.charAt(4));",
          "a": "実行時に例外がスローされる",
          "wrong": [
            "a が出力される",
            "空文字が出力される",
            "コンパイルエラー"
          ],
          "explain": "添字は0から始まるので有効なのは0〜3。範囲外は StringIndexOutOfBoundsException。コンパイラは値の範囲までは調べない。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "System.out.println('A' + 'B');",
          "a": "131",
          "wrong": [
            "AB",
            "65 66",
            "コンパイルエラー"
          ],
          "explain": "char 同士の + は int に昇格して数値の足し算になる（65 + 66）。\"\" + 'A' + 'B' のように先頭に文字列があれば AB になる。"
        },
        {
          "type": "choice",
          "q": "コンパイルできる宣言は？",
          "a": "long l = 100;",
          "wrong": [
            "int i = 10L;",
            "float f = 3.14;",
            "int b = 0b102;"
          ],
          "explain": "int から long は暗黙の拡大変換でOK。0b は2進数の接頭辞なので数字の 2 は使えない。8進数は先頭の 0、16進数は 0x を付ける。"
        },
        {
          "type": "choice",
          "q": "コンパイルできる数値リテラルは？",
          "a": "int n = 1_000_000;",
          "wrong": [
            "int n = _1000;",
            "int n = 1000_;",
            "double d = 1._5;"
          ],
          "explain": "_ は数字と数字の間にだけ置ける。_1000 は数値ではなく「_1000 という名前の変数」と解釈され、未定義なのでエラーになる。"
        },
        {
          "type": "choice",
          "q": "var を使えるのは？",
          "a": "for 文の初期化部のローカル変数",
          "wrong": [
            "インスタンスフィールド",
            "メソッドの引数",
            "メソッドの戻り値の型"
          ],
          "explain": "var はローカル変数（拡張 for の変数や try-with-resources も含む）専用。ラムダ式の引数には (var x, var y) -> ... と書ける。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "Integer a = 127, b = 127;\nSystem.out.println(a == b);",
          "a": "true",
          "wrong": [
            "false",
            "コンパイルエラー",
            "実行時に例外がスローされる"
          ],
          "explain": "-128〜127 のオートボクシングは同じオブジェクトを使い回すと仕様で決まっているので true。範囲外の値の == は true になる保証がないので、ラッパー型の比較は equals を使う。"
        },
        {
          "type": "choice",
          "q": "このコードを実行するとどうなる？",
          "code": "for (int i = 0; i < 3; i++) {\n  int sq = i * i;\n}\nSystem.out.println(i);",
          "a": "コンパイルエラー",
          "wrong": [
            "3 が出力される",
            "2 が出力される",
            "0 が出力される"
          ],
          "explain": "for の初期化部で宣言した i のスコープはループの中だけ。ループの外で使いたいなら、for の前で宣言しておく。"
        },
        {
          "type": "choice",
          "q": "変数 s の内容は？",
          "code": "String s = \"\"\"\n    a\n      b\n    \"\"\";",
          "a": "\"a\\n  b\\n\"",
          "wrong": [
            "\"    a\\n      b\\n\"",
            "\"a\\nb\\n\"",
            "\"a\\n  b\""
          ],
          "explain": "全行に共通するインデント（閉じ \"\"\" の行を含めて4つ）が「付随的な空白」として除かれ、相対的なずれ2つは残る。閉じ \"\"\" が独立した行にあるので末尾に改行が付く。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "var sb = new StringBuilder(\"abc\");\nString s = sb.reverse().toString();\nSystem.out.println(sb + s);",
          "a": "cbacba",
          "wrong": [
            "abccba",
            "cbaabc",
            "コンパイルエラー"
          ],
          "explain": "reverse は新しいオブジェクトを作らず sb 自身を反転させる。StringBuilder と String の + は文字列連結になり、sb は toString されて連結される。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "String a = new String(\"hi\");\nString b = \"hi\";\nSystem.out.print(a == b);\nSystem.out.print(a.intern() == b);",
          "a": "falsetrue",
          "wrong": [
            "truetrue",
            "falsefalse",
            "truefalse"
          ],
          "explain": "new String はプールの外に新しいオブジェクトを作る。intern() はプール内の同じ内容の文字列を返すので、リテラルと == で一致する。"
        },
        {
          "type": "choice",
          "q": "変数の値を代入するとき、キャストなしで代入できるのは？",
          "a": "long の値を float 変数へ",
          "wrong": [
            "int の値を short 変数へ",
            "double の値を float 変数へ",
            "char の値を short 変数へ"
          ],
          "explain": "long → float は精度が落ちることがあっても「拡大変換」扱いで暗黙にできる。char は符号なし16ビット、short は符号付き16ビットなので、互いにキャストが要る。"
        },
        {
          "type": "choice",
          "q": "このコードを実行するとどうなる？",
          "code": "Integer n = null;\nint m = n;\nSystem.out.println(m);",
          "a": "実行時に例外がスローされる",
          "wrong": [
            "0 が出力される",
            "null が出力される",
            "コンパイルエラー"
          ],
          "explain": "アンボクシングは内部で n.intValue() を呼ぶので、null だと NullPointerException。コンパイルは通るので気づきにくい。"
        },
        {
          "type": "fill",
          "q": "＿＿ 型は16ビットの符号なし整数で、0〜65535 を表す",
          "a": "char",
          "wrong": [
            "short",
            "byte",
            "int"
          ],
          "explain": "char は文字を表す型だが中身は数値で、算術演算もできる。同じ16ビットの short は -32768〜32767。"
        },
        {
          "type": "fill",
          "q": "テキストブロックで行末の空白を残したいときは、エスケープ ＿＿ を使う",
          "a": "\\s",
          "wrong": [
            "\\t",
            "\\0",
            "\\b"
          ],
          "explain": "テキストブロックは行末の空白を自動で消す。\\s は空白1つに変換され、空白の除去が終わった後に解釈されるので消されない。"
        },
        {
          "type": "fill",
          "q": "文字列を指定回数くり返した新しい文字列を返すメソッドは ＿＿（Java 11〜）",
          "a": "repeat",
          "wrong": [
            "times",
            "multiply",
            "duplicate"
          ],
          "explain": "\"ab\".repeat(3) は \"ababab\"。回数に0を渡すと空文字、負の数だと IllegalArgumentException になる。"
        },
        {
          "type": "fill",
          "q": "2進数の整数リテラルには接頭辞 ＿＿ を付ける",
          "a": "0b",
          "wrong": [
            "0x",
            "0o",
            "0d"
          ],
          "explain": "0b1010 は10。Java の8進数は 0o ではなく先頭の 0 だけ（010 は8）なので、うっかり 0 を付けると値が変わる。"
        },
        {
          "type": "fill",
          "q": "float 型のリテラルには末尾に ＿＿ を付ける",
          "a": "f",
          "wrong": [
            "d",
            "L",
            "e"
          ],
          "explain": "f（または F）がないと double 扱い。L は long、d は double を明示する接尾辞。e は 1.5e3 のような指数表記に使う。"
        },
        {
          "type": "match",
          "q": "型とビット数を結べ",
          "pairs": [
            [
              "byte",
              "8ビット"
            ],
            [
              "short",
              "16ビット"
            ],
            [
              "int",
              "32ビット"
            ],
            [
              "long",
              "64ビット"
            ]
          ],
          "explain": "整数型は byte から順に2倍ずつ。サイズは OS や CPU によらず仕様で固定されているのが C 言語との違い。"
        },
        {
          "type": "match",
          "q": "メソッドと戻り値の型を結べ",
          "pairs": [
            [
              "length()",
              "int"
            ],
            [
              "charAt()",
              "char"
            ],
            [
              "isBlank()",
              "boolean"
            ],
            [
              "substring()",
              "String"
            ]
          ],
          "explain": "charAt は String ではなく char を返すので、\"a\" と比べるなら equals ではなく == 'a' を使う。"
        },
        {
          "type": "match",
          "q": "リテラルとその型を結べ",
          "pairs": [
            [
              "10L",
              "long"
            ],
            [
              "3.14",
              "double"
            ],
            [
              "'a'",
              "char"
            ],
            [
              "1.0f",
              "float"
            ]
          ],
          "explain": "小数点付きのリテラルは何も付けなければ double。L は小文字の l でもよいが、1 と見分けにくいので大文字が推奨される。"
        },
        {
          "type": "order",
          "q": "表せる値の範囲が狭い順に並べよ",
          "items": [
            "byte",
            "short",
            "int",
            "long"
          ],
          "explain": "それぞれ8・16・32・64ビット。long の最大値は約922京で、int の約21億とは桁違い。"
        },
        {
          "type": "order",
          "q": "テキストブロックがコンパイル時に処理される順に並べよ",
          "items": [
            "改行コードを LF にそろえる",
            "付随的な空白を取り除く",
            "エスケープを解釈する"
          ],
          "explain": "エスケープの解釈が最後なので、\\n や \\s で作った空白・改行はインデント除去の影響を受けない。Windows の CRLF で書いても中身は LF になる。"
        },
        {
          "type": "order",
          "q": "new StringBuilder(\"ab\") に append(\"c\")→insert(0, \"x\")→reverse() の順で実行したとき、中身の変化を順に並べよ",
          "items": [
            "ab",
            "abc",
            "xabc",
            "cbax"
          ],
          "explain": "StringBuilder は自分自身を書き換えるので、途中の状態を戻り値で受け取らなくても変化が残る。String なら毎回新しい文字列ができる。"
        },
        {
          "type": "multi",
          "q": "コンパイルできる宣言を全て選べ",
          "options": [
            "byte b = 127;",
            "byte b = 128;",
            "short s = 'a';",
            "char c = -1;",
            "int i = 3.0;",
            "long l = 'z';"
          ],
          "correct": [
            "byte b = 127;",
            "short s = 'a';",
            "long l = 'z';"
          ],
          "explain": "'a'（97）は short の範囲に収まる定数なので縮小できる。char は負の値を持てないので -1 はエラー。char → long は拡大変換。"
        },
        {
          "type": "multi",
          "q": "コンパイルできる var の宣言を全て選べ",
          "options": [
            "var n = 10;",
            "var s = \"a\";",
            "var a;",
            "var arr = {1, 2};",
            "var x = null;"
          ],
          "correct": [
            "var n = 10;",
            "var s = \"a\";"
          ],
          "explain": "配列の初期化子 {1, 2} だけでは型が決まらないのでエラー。var arr = new int[]{1, 2}; なら通る。"
        },
        {
          "type": "multi",
          "q": "String s = \"Java\"; のとき true になる式を全て選べ",
          "options": [
            "s.equals(\"Java\")",
            "s.equalsIgnoreCase(\"JAVA\")",
            "s.startsWith(\"Ja\")",
            "s.contains(\"jav\")",
            "s.endsWith(\"A\")"
          ],
          "correct": [
            "s.equals(\"Java\")",
            "s.equalsIgnoreCase(\"JAVA\")",
            "s.startsWith(\"Ja\")"
          ],
          "explain": "contains や endsWith は大文字小文字を区別する。区別せずに探したいときは、両方を toLowerCase() してから比べるのが定番。"
        },
        {
          "type": "multi",
          "q": "StringBuilder にはあって String にはないメソッドを全て選べ",
          "options": [
            "reverse()",
            "insert()",
            "delete()",
            "strip()",
            "toUpperCase()",
            "isBlank()"
          ],
          "correct": [
            "reverse()",
            "insert()",
            "delete()"
          ],
          "explain": "中身を書き換えるメソッドは StringBuilder 側にある。逆に strip・toUpperCase・isBlank は String だけのメソッド。length・charAt・indexOf・substring は両方にある。"
        }
      ],
      "cliffhanger": "型と文字列の正体はつかんだ。次は、その値をどう計算し、どう分岐させるか――演算子の優先順位と switch の罠が待っている。"
    },
    {
      "title": "演算子と条件分岐",
      "icon": "🔀",
      "story": "演算子の問題は「人間の直感」と「Java の規則」がずれる所を正確に突いてくる。x++ と ++x、複合代入の暗黙キャスト、短絡評価で右辺が実行されない場面などは定番中の定番だ。switch 式やパターンマッチングといった新しめの構文も、網羅性やスコープの規則まで問われる。",
      "facts": [
        {
          "text": "&& と || は短絡評価。結果が決まれば右辺は実行されない",
          "detail": "& と | は boolean にも使えるが、こちらは必ず両辺を評価する。右辺に ++i などの副作用があると結果が変わる。",
          "rarity": "N"
        },
        {
          "text": "複合代入 += は暗黙のキャストを含む",
          "detail": "byte b = 10; b += 1; はOKだが、b = b + 1; は b + 1 が int になるのでコンパイルエラー。b += 1 は b = (byte)(b + 1) と同じ意味になる。",
          "rarity": "R"
        },
        {
          "text": "整数同士の / は小数点以下を0の方向へ切り捨てる",
          "detail": "7 / 2 は 3、-7 / 2 は -3（-4 ではない）。% の結果の符号は割られる数と同じで、-7 % 3 は -1。",
          "rarity": "N"
        },
        {
          "text": "switch 式は全ての値を網羅しないとコンパイルエラー",
          "detail": "int や String をセレクタにする switch 式では default が事実上必須。enum で全定数を書けば default なしでもよい。",
          "rarity": "SR"
        },
        {
          "text": "instanceof のパターン変数は「真と確定した場所」でだけ使える",
          "detail": "o instanceof String s && s.isEmpty() はOKだが、|| でつなぐと s が使えずコンパイルエラー。if (!(o instanceof String s)) return; の後なら、続く文で s が使える。",
          "rarity": "SR"
        },
        {
          "text": "x = x++; を何回実行しても x は変わらない",
          "detail": "右辺 x++ はまず元の値を返し、その後 x を1増やす。最後に元の値が x に代入され、増えた分は上書きされて消える。",
          "rarity": "SSR"
        }
      ],
      "questions": [
        {
          "type": "tf",
          "q": "このコードは 6 を出力する。",
          "code": "int x = 5;\nx = x++;\nSystem.out.println(x);",
          "a": false,
          "explain": "出力は 5。x++ は「5 を返してから x を6にする」が、その直後に返された5が x に代入されて上書きされる。C 言語では未定義動作だが、Java では結果が仕様で決まっている。"
        },
        {
          "type": "tf",
          "q": "このコードはコンパイルできる。",
          "code": "byte b = 10;\nb += 1;",
          "a": true,
          "explain": "複合代入は結果を左辺の型へ自動でキャストする。そのため b += 300; もコンパイルは通り、値はあふれて切り詰められる。"
        },
        {
          "type": "tf",
          "q": "このコードはコンパイルできる。",
          "code": "byte b = 10;\nb = b + 1;",
          "a": false,
          "explain": "byte・short・char の算術演算は必ず int に昇格するので、int を byte に代入しようとしてエラーになる。b = (byte)(b + 1); と書けば通る。"
        },
        {
          "type": "tf",
          "q": "% 演算の結果の符号は、割られる数（左オペランド）と同じになる。",
          "a": true,
          "explain": "-7 % 3 は -1、7 % -3 は 1。常に0以上の余りがほしいときは Math.floorMod を使う。"
        },
        {
          "type": "tf",
          "q": "このコードはコンパイルできる。",
          "code": "int a = 0;\nif (a = 1) {\n  System.out.println(\"A\");\n}",
          "a": false,
          "explain": "a = 1 の結果は int なので if の条件にできない。Java の if は boolean しか受け付けないので、C 言語のような = と == の書き間違いを防げる。"
        },
        {
          "type": "tf",
          "q": "このコードはコンパイルエラーになる。",
          "code": "boolean f = false;\nif (f = true) {\n  System.out.println(\"A\");\n}",
          "a": false,
          "explain": "f = true の結果は boolean の true なので、コンパイルが通り A が出力される。boolean 変数だけはこの書き間違いが素通りするので要注意。"
        },
        {
          "type": "tf",
          "q": "Java 17 の switch 文では、セレクタに long 型の値を使える。",
          "a": false,
          "explain": "long・float・double・boolean はセレクタにできない。使えるのは char・byte・short・int とそのラッパー型、String、enum。"
        },
        {
          "type": "tf",
          "q": "このコードを実行すると ArithmeticException がスローされる。",
          "code": "System.out.println(10 / 0.0);",
          "a": false,
          "explain": "浮動小数点の0除算は例外にならず Infinity が出力される。例外になるのは整数どうしの 10 / 0 だけ。0.0 / 0.0 は NaN になる。"
        },
        {
          "type": "tf",
          "q": "このコード（メソッドの中）はコンパイルできる。",
          "code": "Object o = \"hi\";\nif (!(o instanceof String s)) {\n  return;\n}\nSystem.out.println(s.length());",
          "a": true,
          "explain": "if の中で必ず return するので、if の後では「o は String」と確定し、パターン変数 s がそのまま使える。これをフロースコープと呼ぶ。"
        },
        {
          "type": "tf",
          "q": "このコードは true を出力する。",
          "code": "Integer a = 1000;\nint b = 1000;\nSystem.out.println(a == b);",
          "a": true,
          "explain": "片方が int なので a がアンボクシングされ、数値として比べられる。Integer どうしの == なら参照の比較になり、1000 では false になりうる。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "int i = 10;\nint j = i++ + ++i;\nSystem.out.println(j);",
          "a": 22,
          "unit": "",
          "min": 10,
          "max": 40,
          "explain": "左から順に、i++ が10を返して i は11、続く ++i で i は12になり12を返す。10 + 12 = 22。式は必ず左から評価される。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "System.out.println(-7 / 2);",
          "a": -3,
          "unit": "",
          "min": -10,
          "max": 5,
          "explain": "整数除算は0の方向へ切り捨てるので -3.5 → -3。数学の切り捨て（-4）がほしいときは Math.floorDiv を使う。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "int x = 3;\nx += x++ * 2;\nSystem.out.println(x);",
          "a": 9,
          "unit": "",
          "min": 0,
          "max": 20,
          "explain": "複合代入はまず左辺の値3を取っておく。右辺 x++ * 2 は 3 * 2 = 6（x は一時的に4）で、3 + 6 = 9 が x に入る。途中の4は上書きされる。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "int c = 10 - 2 * 3 % 4;\nSystem.out.println(c);",
          "a": 8,
          "unit": "",
          "min": 0,
          "max": 20,
          "explain": "* と % は同じ優先順位で左から計算する。2 * 3 = 6、6 % 4 = 2、10 - 2 = 8。+ と - より先に計算される。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "int n = 2, c = 0;\nswitch (n) {\n  case 1: c++;\n  case 2: c++;\n  case 3: c++;\n  default: c++;\n}\nSystem.out.println(c);",
          "a": 3,
          "unit": "",
          "min": 0,
          "max": 10,
          "explain": "break がないので case 2 から下へ流れ落ち（フォールスルー）、case 2・case 3・default の3回加算される。default は最後に書く必要はなく、途中に置いても動く。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int i = 0;\nboolean b = (i == 0) || (++i > 0);\nboolean c = (i == 0) | (++i > 0);\nSystem.out.println(i);",
          "a": "1",
          "wrong": [
            "0",
            "2",
            "コンパイルエラー"
          ],
          "explain": "|| は左辺が true の時点で右辺を飛ばすので i は0のまま。| は両辺を評価するので3行目で i が1になる。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "System.out.println(true ? 1 : 2.0);",
          "a": "1.0",
          "wrong": [
            "1",
            "2.0",
            "コンパイルエラー"
          ],
          "explain": "三項演算子の2つの結果が int と double だと、式全体の型は double にそろえられる。選ばれなかった側の型が結果に影響する珍しい例。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int x = 5;\nif (x > 10)\n  if (x > 3) System.out.println(\"A\");\nelse System.out.println(\"B\");\nSystem.out.println(\"C\");",
          "a": "C だけ",
          "wrong": [
            "B と C",
            "A と C",
            "コンパイルエラー"
          ],
          "explain": "else はインデントに関係なく、一番近い if（x > 3）と組になる。外側の if が false なので内側は丸ごと飛ばされる。迷ったら { } を書くのが安全。"
        },
        {
          "type": "choice",
          "q": "このコードを実行するとどうなる？",
          "code": "int d = 3;\nString s = switch (d) {\n  case 1 -> \"A\";\n  case 2 -> \"B\";\n};\nSystem.out.println(s);",
          "a": "コンパイルエラー",
          "wrong": [
            "null が出力される",
            "空文字が出力される",
            "実行時に例外がスローされる"
          ],
          "explain": "switch 式は必ず値を返す必要があるので、int のように全値を書き切れない型では default がないとコンパイルエラー。switch 文なら default がなくても通る。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int n = 1;\nswitch (n) {\n  case 1 -> System.out.print(\"A\");\n  case 2 -> System.out.print(\"B\");\n  default -> System.out.print(\"C\");\n}",
          "a": "A",
          "wrong": [
            "ABC",
            "AC",
            "コンパイルエラー"
          ],
          "explain": "アロー（->）形式の case はフォールスルーしないので break 不要。switch 文でもアロー形式が使える。"
        },
        {
          "type": "choice",
          "q": "1つの switch の中に case 1 -> ... と case 2: ... を混在させるとどうなる？",
          "a": "コンパイルエラー",
          "wrong": [
            "正常に動き、case 2 だけフォールスルーする",
            "実行時に例外がスローされる",
            "警告は出るが動く"
          ],
          "explain": "アロー形式とコロン形式はどちらか一方に統一しなければならない。なお switch 式でもコロン形式を使えて、その場合は yield で値を返す。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "String a = \"hi\";\nString b = new String(\"hi\");\nSystem.out.println(\n  a.equals(b) + \" \" + (a == b));",
          "a": "true false",
          "wrong": [
            "true true",
            "false false",
            "false true"
          ],
          "explain": "equals は中身、== は参照（同じオブジェクトか）を比べる。(a == b) のかっこを外すと + が先に計算され、文字列と b の比較になってしまう。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "System.out.println(1 + 2 + \"3\" + 4 + 5);",
          "a": "3345",
          "wrong": [
            "12345",
            "339",
            "69"
          ],
          "explain": "+ は左から計算する。1 + 2 = 3 までは数値の足し算、\"3\" が出てきた時点から後ろは全部文字列連結になる。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int x = 10;\nx -= 3 + 2;\nSystem.out.println(x);",
          "a": "5",
          "wrong": [
            "9",
            "15",
            "コンパイルエラー"
          ],
          "explain": "複合代入の右辺は丸ごと先に計算されるので x = x - (3 + 2)。代入演算子は優先順位が最も低い。"
        },
        {
          "type": "choice",
          "q": "このコードを実行するとどうなる？",
          "code": "Object o = 42;\nif (o instanceof Integer i || i > 40) {\n  System.out.println(i);\n}",
          "a": "コンパイルエラー",
          "wrong": [
            "42 が出力される",
            "何も出力されない",
            "実行時に例外がスローされる"
          ],
          "explain": "|| の右辺は「左辺が false のとき」だけ評価されるので、そこでは i が使えない。&& なら右辺は左辺が true のときだけなので i を使える。"
        },
        {
          "type": "choice",
          "q": "このコードを実行するとどうなる？",
          "code": "String s = null;\nswitch (s) {\n  case \"a\":\n    System.out.print(\"A\");\n    break;\n  default:\n    System.out.print(\"D\");\n}",
          "a": "実行時に例外がスローされる",
          "wrong": [
            "D が出力される",
            "何も出力されない",
            "コンパイルエラー"
          ],
          "explain": "セレクタが null だと default には行かず NullPointerException になる。Java 21 のパターンマッチング switch では case null を書いて受け止められる。"
        },
        {
          "type": "choice",
          "q": "【SE21】このコードの出力は？",
          "code": "Object o = 3.5;\nString r = switch (o) {\n  case Integer i -> \"int\";\n  case Double d -> \"double\";\n  default -> \"other\";\n};\nSystem.out.println(r);",
          "a": "double",
          "wrong": [
            "int",
            "other",
            "コンパイルエラー"
          ],
          "explain": "3.5 は Double にオートボクシングされ、型パターンで振り分けられる。Java 21 から switch のセレクタに任意の参照型を使えるようになった。"
        },
        {
          "type": "choice",
          "q": "【SE21】このコードを実行するとどうなる？",
          "code": "Object o = 1;\nString r = switch (o) {\n  case Number n -> \"num\";\n  case Integer i -> \"int\";\n  default -> \"other\";\n};",
          "a": "コンパイルエラー",
          "wrong": [
            "r は \"num\" になる",
            "r は \"int\" になる",
            "実行時に例外がスローされる"
          ],
          "explain": "Integer は Number のサブクラスなので、先の case Number が全て受け止めてしまい case Integer に到達できない（支配される）。狭い型を先に書けばOK。"
        },
        {
          "type": "choice",
          "q": "【SE21】このコードの出力は？",
          "code": "record P(int x, int y) {}\nObject o = new P(1, 2);\nif (o instanceof P(int a, int b)) {\n  System.out.println(a + b);\n}",
          "a": "3",
          "wrong": [
            "12",
            "P[x=1, y=2]",
            "コンパイルエラー"
          ],
          "explain": "レコードパターンは型の判定と同時に、成分を変数 a・b に分解して取り出す。record はメソッドの中でもローカルに宣言できる。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int i = 5;\nlong l = i * 1_000_000_000;\nSystem.out.println(l);",
          "a": "705032704",
          "wrong": [
            "5000000000",
            "コンパイルエラー",
            "実行時に例外がスローされる"
          ],
          "explain": "i * 1_000_000_000 は int どうしの計算なので、long に代入される前にあふれてしまう。i * 1_000_000_000L と書けば正しく50億になる。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int x = 7;\nString s = x % 2 == 0 ? \"偶\"\n  : x > 5 ? \"大きい奇\" : \"小さい奇\";\nSystem.out.println(s);",
          "a": "大きい奇",
          "wrong": [
            "偶",
            "小さい奇",
            "コンパイルエラー"
          ],
          "explain": "三項演算子は右から結合するので、a ? b : (c ? d : e) と読む。7 は奇数で5より大きい。"
        },
        {
          "type": "fill",
          "q": "switch 式のブロック {} の中から値を返すキーワードは ＿＿",
          "a": "yield",
          "wrong": [
            "return",
            "break",
            "give"
          ],
          "explain": "switch 式の中で return を書くとコンパイルエラー。switch を文として使うときは値を返さないので yield は不要。"
        },
        {
          "type": "fill",
          "q": "o instanceof String s のように、型の判定と変数への代入を同時に行う機能を ＿＿ という",
          "a": "パターンマッチング",
          "wrong": [
            "キャスト",
            "ジェネリクス",
            "オートボクシング"
          ],
          "explain": "Java 16 で正式機能になった。従来の「instanceof で調べてからキャスト」の2段階を1つにまとめられる。"
        },
        {
          "type": "fill",
          "q": "&& や || のように、結果が決まった時点で右辺を評価しない仕組みを ＿＿ 評価という",
          "a": "短絡",
          "wrong": [
            "遅延",
            "並列",
            "先行"
          ],
          "explain": "英語ではショートサーキット。obj != null && obj.isOk() のように、null チェックを先に書く定番の書き方はこの仕組みに頼っている。"
        },
        {
          "type": "fill",
          "q": "r が 1 になるように ＿＿ に入る演算子は？",
          "code": "int x = 7;\nint r = x ＿＿ 3;",
          "a": "%",
          "wrong": [
            "/",
            "&",
            "^"
          ],
          "explain": "7 % 3 = 1。ほかは 7 / 3 = 2、7 & 3 = 3、7 ^ 3 = 4 になる。^ は累乗ではなく排他的論理和（XOR）。"
        },
        {
          "type": "fill",
          "q": "switch 文で break を書かないと次の case の処理も続けて実行される。これを ＿＿ という",
          "a": "フォールスルー",
          "wrong": [
            "オーバーライド",
            "シャドーイング",
            "ショートサーキット"
          ],
          "explain": "「落ちて通り抜ける」という意味。わざと複数の case で同じ処理をしたいときに使うこともある。"
        },
        {
          "type": "match",
          "q": "式とその値を結べ",
          "pairs": [
            [
              "7 / 2",
              "3"
            ],
            [
              "7 % 2",
              "1"
            ],
            [
              "7 / 2.0",
              "3.5"
            ],
            [
              "-7 / 2",
              "-3"
            ]
          ],
          "explain": "どちらかが double なら小数の割り算になる。7 / 2 を 3.5 にしたいなら (double) 7 / 2 のように片方をキャストする。"
        },
        {
          "type": "match",
          "q": "演算子と呼び名を結べ",
          "pairs": [
            [
              "? :",
              "三項演算子"
            ],
            [
              "+=",
              "複合代入演算子"
            ],
            [
              "&&",
              "条件AND"
            ],
            [
              "++",
              "インクリメント"
            ]
          ],
          "explain": "三項演算子は Java で唯一オペランドを3つ取る演算子なのでこう呼ばれる。正式名は条件演算子。"
        },
        {
          "type": "match",
          "q": "switch の書き方と役割を結べ",
          "pairs": [
            [
              "yield",
              "ブロックから値を返す"
            ],
            [
              "->",
              "フォールスルーしない"
            ],
            [
              "default",
              "どれにも一致しない時"
            ],
            [
              "case 1, 2",
              "複数の値をまとめる"
            ]
          ],
          "explain": "case 1, 2 のようにカンマで並べる書き方は Java 14 から使える。コロン形式でも case 1, 2: と書ける。"
        },
        {
          "type": "order",
          "q": "演算子を優先順位の高い順に並べよ",
          "items": [
            "x++（後置）",
            "* / %",
            "+ -",
            "< >",
            "&&"
          ],
          "explain": "単項 → 乗除 → 加減 → 比較 → 論理 の順。比較より算術が先なので、a + 1 < b * 2 はかっこなしで意図どおりに動く。"
        },
        {
          "type": "order",
          "q": "論理系の演算子を優先順位の高い順に並べよ",
          "items": [
            "!",
            "&&",
            "||",
            "? :",
            "="
          ],
          "explain": "&& は || より強いので、a || b && c は a || (b && c) と読まれる。代入は最も弱い。"
        },
        {
          "type": "order",
          "q": "int r = a() + b() * c(); を実行したとき、メソッドが呼ばれる順に並べよ",
          "items": [
            "a()",
            "b()",
            "c()"
          ],
          "explain": "優先順位は「どれとどれを組にするか」を決めるだけで、評価は必ず左から行われる。* が先でも a() が最初に呼ばれる。"
        },
        {
          "type": "multi",
          "q": "byte b = 10; の後に書いてコンパイルできる文を全て選べ",
          "options": [
            "b += 1;",
            "b = b + 1;",
            "b++;",
            "b = (byte)(b + 1);",
            "b = -b;"
          ],
          "correct": [
            "b += 1;",
            "b++;",
            "b = (byte)(b + 1);"
          ],
          "explain": "++ と複合代入は暗黙のキャストを含む。単項マイナス -b も int に昇格するので、そのまま byte には代入できない。"
        },
        {
          "type": "multi",
          "q": "Java 17 の switch 文でセレクタに使える型を全て選べ",
          "options": [
            "String",
            "char",
            "Integer",
            "long",
            "boolean",
            "double"
          ],
          "correct": [
            "String",
            "char",
            "Integer"
          ],
          "explain": "ラッパー型はアンボクシングされて使える。String の switch は内部で hashCode と equals を使って振り分けている。"
        },
        {
          "type": "multi",
          "q": "true になる式を全て選べ",
          "options": [
            "10 / 3 == 3",
            "10 % 3 == 1",
            "0.1 + 0.2 == 0.3",
            "'a' < 'b'",
            "5 / 2.0 == 2"
          ],
          "correct": [
            "10 / 3 == 3",
            "10 % 3 == 1",
            "'a' < 'b'"
          ],
          "explain": "0.1 + 0.2 は 0.30000000000000004 になり、0.3 と一致しない。お金の計算に double を使わず BigDecimal を使うのはこのため。"
        },
        {
          "type": "multi",
          "q": "Object o のとき、コンパイルできる文を全て選べ",
          "options": [
            "if (o instanceof String s && s.isEmpty()) {}",
            "if (o instanceof String s || s.isEmpty()) {}",
            "if (!(o instanceof String s)) {} else { s.length(); }",
            "if (o instanceof String) { s.length(); }"
          ],
          "correct": [
            "if (o instanceof String s && s.isEmpty()) {}",
            "if (!(o instanceof String s)) {} else { s.length(); }"
          ],
          "explain": "! で否定した場合、パターン変数は else 側で使えるようになる。変数名を書かない従来の instanceof では s は宣言されない。"
        }
      ],
      "cliffhanger": "分岐は制した。次は同じ処理を何度も回すループと、値をまとめて持つ配列――到達不能コードと境界値の罠が口を開けている。"
    },
    {
      "title": "繰り返しと配列",
      "icon": "🔁",
      "story": "ループの問題では「何回まわるか」「どこで抜けるか」を1行ずつ追う力が試される。ラベル付き break・continue や、到達できない文がコンパイルエラーになる規則は特に狙われやすい。配列は宣言の書き方の自由さと、length と length() の違い、既定値、例外の種類まで細かく出題される。",
      "facts": [
        {
          "text": "do-while は条件に関係なく最低1回は本体を実行する",
          "detail": "条件を後で判定するため。do { } while (条件); の最後のセミコロンを忘れるとコンパイルエラーになる。",
          "rarity": "N"
        },
        {
          "text": "ラベル付きの break・continue で外側のループを直接操作できる",
          "detail": "outer: for (...) と名前を付け、内側から break outer; と書けば二重ループを一気に抜けられる。continue outer; なら外側の次の周回へ進む。",
          "rarity": "R"
        },
        {
          "text": "int[] a, b[]; と書くと、b は2次元配列になる",
          "detail": "型の後ろの [] は全変数に、変数名の後ろの [] はその変数だけに付く。int a[], b; なら b はただの int。",
          "rarity": "SR"
        },
        {
          "text": "配列の長さは length（フィールド）、文字列は length()（メソッド）",
          "detail": "配列に length() と書いたり、String に length と書いたりするとコンパイルエラー。コレクションは size() でさらに別。",
          "rarity": "N"
        },
        {
          "text": "配列の要素は自動で 0・false・null に初期化される",
          "detail": "new int[3] の中身は全部0。一方、メソッド内のローカル変数は自動で初期化されず、代入前に読むとコンパイルエラーになる。",
          "rarity": "R"
        },
        {
          "text": "Object[] o = new String[1]; o[0] = 1; は実行時に例外になる",
          "detail": "配列は「String[] は Object[] の一種」とみなされるので代入まではコンパイルが通る。しかし実体は String の配列なので、Integer を入れた瞬間に ArrayStoreException がスローされる。",
          "rarity": "SSR"
        }
      ],
      "questions": [
        {
          "type": "tf",
          "q": "このコードはコンパイルできる。",
          "code": "while (false) {\n  System.out.println(\"x\");\n}",
          "a": false,
          "explain": "条件が定数 false の while は本体に到達できないため、到達不能コードとしてコンパイルエラー。ところが if (false) { ... } は条件付きコンパイル用にわざと許されている。"
        },
        {
          "type": "tf",
          "q": "このコードはコンパイルできる。",
          "code": "if (false) {\n  System.out.println(\"x\");\n}",
          "a": true,
          "explain": "if だけは定数 false でもエラーにしない特例がある。デバッグ用コードを static final boolean DEBUG で切り替える書き方のための仕様。"
        },
        {
          "type": "tf",
          "q": "for (;;) { } はコンパイルできる。",
          "a": true,
          "explain": "初期化・条件・更新はすべて省略でき、条件を省くと無限ループになる。ただしその直後に文を書くと到達不能でコンパイルエラーになる。"
        },
        {
          "type": "tf",
          "q": "このコードはコンパイルできる。",
          "code": "int[] a = {1, 2, 3};\nSystem.out.println(a.length());",
          "a": false,
          "explain": "配列の length はフィールドなので () は付けない。String は逆に length() メソッドなので、混同させる問題が定番。"
        },
        {
          "type": "tf",
          "q": "このコードはコンパイルエラーになる。",
          "code": "int[] a = new int[3];\nSystem.out.println(a[3]);",
          "a": false,
          "explain": "コンパイルは通り、実行時に ArrayIndexOutOfBoundsException がスローされる。添字が定数でもコンパイラは範囲を調べない。"
        },
        {
          "type": "tf",
          "q": "int[][] m = new int[3][]; はコンパイルできる。",
          "a": true,
          "explain": "最初の次元だけ決めれば、2次元目は後から m[0] = new int[5]; のように行ごとに違う長さで作れる（ジャグ配列）。作るまで m[0] は null。"
        },
        {
          "type": "tf",
          "q": "int[][] m = new int[][3]; はコンパイルできる。",
          "a": false,
          "explain": "長さは左（外側）の次元から順に指定しなければならない。外側を省いて内側だけ決めることはできない。"
        },
        {
          "type": "tf",
          "q": "このコードは true を出力する。",
          "code": "int[] a = {1, 2};\nint[] b = {1, 2};\nSystem.out.println(a.equals(b));",
          "a": false,
          "explain": "配列の equals は Object のままなので、参照が同じかどうかしか見ない。中身を比べるには Arrays.equals(a, b) を使う。"
        },
        {
          "type": "tf",
          "q": "int[] a = new int[2]{1, 2}; はコンパイルできる。",
          "a": false,
          "explain": "初期化子 {1, 2} を書くときは長さを指定できない。new int[]{1, 2} か、宣言と同時なら {1, 2} だけでよい。"
        },
        {
          "type": "tf",
          "q": "このコードは 2 を出力する。",
          "code": "int[] a = {1, 2, 3};\nfor (int x : a) x *= 2;\nSystem.out.println(a[0]);",
          "a": false,
          "explain": "出力は 1。拡張 for の x は要素のコピーなので、x を書き換えても配列は変わらない。書き換えたいなら添字を使う通常の for を使う。"
        },
        {
          "type": "tf",
          "q": "public static void main(String... args) はエントリポイントとして使える。",
          "a": true,
          "explain": "可変長引数 String... は中身が String[] と同じ扱いなので有効。引数名も args でなくてよく、static public の順でも問題ない。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "int i = 0;\ndo {\n  i++;\n} while (i < 0);\nSystem.out.println(i);",
          "a": 1,
          "unit": "",
          "min": 0,
          "max": 5,
          "explain": "条件は最初から false だが、do-while は先に本体を1回実行してから判定するので1。while 文なら0のまま。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "int c = 0;\nouter:\nfor (int i = 0; i < 3; i++) {\n  for (int j = 0; j < 3; j++) {\n    if (j == 2) continue outer;\n    c++;\n  }\n}\nSystem.out.println(c);",
          "a": 6,
          "unit": "",
          "min": 0,
          "max": 15,
          "explain": "各 i について j = 0, 1 で加算し、j == 2 で外側の次の周回へ飛ぶので 2 × 3 = 6。continue で指定できるのはループ文に付けたラベルだけ。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "int[][] m = {{1, 2}, {3, 4, 5}, {6}};\nint n = m[1].length + m.length;\nSystem.out.println(n);",
          "a": 6,
          "unit": "",
          "min": 1,
          "max": 15,
          "explain": "m[1] は {3, 4, 5} で長さ3、m 自体は3行なので 3 + 3 = 6。2次元配列は「配列の配列」なので、行ごとに長さが違ってよい。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "int c = 0;\nfor (int i = 0; i < 10; i += 3) c++;\nSystem.out.println(c);",
          "a": 4,
          "unit": "",
          "min": 0,
          "max": 10,
          "explain": "i は 0, 3, 6, 9 の4回で、12 になった時点で終了。更新式には i++ 以外の任意の式を書ける。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "int[] a = {1, 3, 5, 7};\nSystem.out.println(\n  Arrays.binarySearch(a, 4));",
          "a": -3,
          "unit": "",
          "min": -10,
          "max": 5,
          "explain": "見つからないときは「-(挿入位置) - 1」を返す。4 を入れるべき位置は2なので -2 - 1 = -3。-1 を足すのは、挿入位置0でも結果が負になるようにするため。"
        },
        {
          "type": "number",
          "q": "このコードの出力は？",
          "code": "int[] a = {1, 2, 3}, b = {1, 2, 4};\nSystem.out.println(\n  Arrays.mismatch(a, b));",
          "a": 2,
          "unit": "",
          "min": -1,
          "max": 6,
          "explain": "mismatch は最初に違う要素の添字を返し、完全に一致すれば -1 を返す。片方がもう片方の先頭部分と一致するなら、短いほうの長さが返る。"
        },
        {
          "type": "choice",
          "q": "int[] a, b[]; と宣言したとき、b の型は？",
          "a": "int[][]（2次元配列）",
          "wrong": [
            "int[]",
            "int",
            "コンパイルエラー"
          ],
          "explain": "型側の [] が a と b の両方に付き、さらに b の後ろの [] が b だけに付く。読みにくいので実務では避けるが、試験では頻出。"
        },
        {
          "type": "choice",
          "q": "int a[], b; と宣言したとき、b の型は？",
          "a": "int",
          "wrong": [
            "int[]",
            "int[][]",
            "コンパイルエラー"
          ],
          "explain": "変数名の後ろの [] はその変数だけのもの。C 言語風の書き方 int a[] も Java では有効。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "String[] s = new String[2];\nSystem.out.println(s[0]);",
          "a": "null",
          "wrong": [
            "空文字（何も表示されない）",
            "コンパイルエラー",
            "実行時に例外がスローされる"
          ],
          "explain": "参照型の配列の要素は null で初期化される。println(null の String) は例外にならず null と表示するが、s[0].length() は NullPointerException になる。"
        },
        {
          "type": "choice",
          "q": "このコード（メソッドの中）を実行するとどうなる？",
          "code": "int x;\nSystem.out.println(x);",
          "a": "コンパイルエラー",
          "wrong": [
            "0 が出力される",
            "null が出力される",
            "実行時に例外がスローされる"
          ],
          "explain": "ローカル変数は自動で初期化されないので、代入前に読むとコンパイルエラー。フィールドや配列の要素なら自動で0になる。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int[] a = {3, 1, 2};\nArrays.sort(a);\nSystem.out.println(Arrays.toString(a));",
          "a": "[1, 2, 3]",
          "wrong": [
            "[3, 1, 2]",
            "123",
            "[I@ で始まる文字列"
          ],
          "explain": "Arrays.sort は新しい配列を返さず、a そのものを昇順に並べ替える（戻り値は void）。toString はカンマと空白区切りで [ ] に囲む。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int[] a = {1, 2};\nSystem.out.println(a);",
          "a": "[I@ で始まる文字列",
          "wrong": [
            "[1, 2]",
            "1 2",
            "コンパイルエラー"
          ],
          "explain": "配列は toString をオーバーライドしていないので「型名@ハッシュ値」になる。[I は int 配列を表す内部的な型名。"
        },
        {
          "type": "choice",
          "q": "このコードを実行するとどうなる？",
          "code": "Object[] o = new String[2];\no[0] = \"a\";\no[1] = 1;",
          "a": "3行目で実行時に例外がスローされる",
          "wrong": [
            "3行目でコンパイルエラー",
            "1行目でコンパイルエラー",
            "正常に終了する"
          ],
          "explain": "配列は共変（String[] を Object[] として扱える）なのでコンパイルは通るが、実体は String 配列なので ArrayStoreException。ジェネリクスの List<Object> = List<String> は逆にコンパイルエラーになる。"
        },
        {
          "type": "choice",
          "q": "このコードを実行するとどうなる？",
          "code": "for (int i = 0; i < 3; i++) {\n  break;\n  System.out.println(i);\n}",
          "a": "コンパイルエラー",
          "wrong": [
            "0 が出力される",
            "何も出力されない",
            "0 1 2 が出力される"
          ],
          "explain": "break の直後の文には絶対に到達できないので、到達不能コードとしてコンパイルエラー。return・continue・throw の直後も同じ。"
        },
        {
          "type": "choice",
          "q": "このコードを実行するとどうなる？",
          "code": "while (true) {\n}\nSystem.out.println(\"end\");",
          "a": "コンパイルエラー",
          "wrong": [
            "end が出力される",
            "何も出力されずに終わる",
            "実行時に例外がスローされる"
          ],
          "explain": "break のない while (true) は抜け出せないので、後ろの文は到達不能。ループの中に break を1つ書けばコンパイルが通る。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int i = 0;\nwhile (i < 5) {\n  i++;\n  if (i % 2 == 0) continue;\n  System.out.print(i);\n}",
          "a": "135",
          "wrong": [
            "12345",
            "24",
            "0246"
          ],
          "explain": "continue は残りの処理を飛ばして条件判定に戻る。i++ を continue より前に書いているので無限ループにならない。後ろに書くと i が0のまま増えず、永遠に回る。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int[][] m = {{1, 2}, {3}};\nint s = 0;\nfor (int[] r : m)\n  for (int v : r) s += v;\nSystem.out.println(s);",
          "a": "6",
          "wrong": [
            "3",
            "コンパイルエラー",
            "実行時に例外がスローされる"
          ],
          "explain": "2次元配列を拡張 for で回すと、まず1行分の int[] が取り出される。それをさらに拡張 for で回して全要素を足す。"
        },
        {
          "type": "choice",
          "q": "java Hello one two で実行したとき、main の args[0] は？",
          "a": "\"one\"",
          "wrong": [
            "\"Hello\"",
            "\"java\"",
            "null"
          ],
          "explain": "クラス名は args に含まれず、args.length は2。引数を何も渡さないと args は null ではなく長さ0の配列になる。"
        },
        {
          "type": "choice",
          "q": "Arrays.compare(new int[]{1, 2}, new int[]{1, 3}) の結果は？",
          "a": "負の値",
          "wrong": [
            "0",
            "正の値",
            "コンパイルエラー"
          ],
          "explain": "先頭から比べて最初に違う要素（2 と 3）で大小を決める辞書順の比較。Java 9 で追加され、同じ内容なら0を返す。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "String[] s = {\"b\", \"B\", \"a\"};\nArrays.sort(s);\nSystem.out.println(Arrays.toString(s));",
          "a": "[B, a, b]",
          "wrong": [
            "[a, b, B]",
            "[a, B, b]",
            "[b, B, a]"
          ],
          "explain": "文字列は文字コード順に並ぶので、大文字（B は66）は小文字（a は97）より前に来る。数字はさらにその前。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "a:\nfor (int i = 0; i < 3; i++) {\n  for (int j = 0; j < 3; j++) {\n    if (i == 1) break a;\n    System.out.print(j);\n  }\n}",
          "a": "012",
          "wrong": [
            "012012",
            "0",
            "01"
          ],
          "explain": "i が0の周回で j = 0, 1, 2 を出力し、i が1になった最初で外側ごと抜ける。ラベル名には変数と同じ名前（a など）も使える。"
        },
        {
          "type": "choice",
          "q": "このコードを実行するとどうなる？",
          "code": "int[] a = {1, 2, 3};\nfor (int i = 0; i <= a.length; i++)\n  System.out.print(a[i] + \" \");",
          "a": "1 2 3 を出力した後、例外がスローされる",
          "wrong": [
            "1 2 3 を出力して正常に終わる",
            "何も出力せずに例外がスローされる",
            "コンパイルエラー"
          ],
          "explain": "<= のせいで最後に a[3] を読みに行き ArrayIndexOutOfBoundsException。例外が出る前の出力はそのまま残る。"
        },
        {
          "type": "choice",
          "q": "このコードの出力は？",
          "code": "int n = 0;\nfor (int i = 0, j = 5; i < j; i++, j--)\n  n++;\nSystem.out.println(n);",
          "a": "3",
          "wrong": [
            "2",
            "5",
            "コンパイルエラー"
          ],
          "explain": "(i, j) = (0, 5), (1, 4), (2, 3) の3回で、(3, 2) になって終了。初期化部と更新部はカンマで複数書ける。"
        },
        {
          "type": "fill",
          "q": "配列の要素数はフィールド ＿＿ で取得する",
          "a": "length",
          "wrong": [
            "length()",
            "size()",
            "size"
          ],
          "explain": "配列の length は final なので代入できない。一度作った配列の長さは変えられず、伸ばすには Arrays.copyOf などで作り直す。"
        },
        {
          "type": "fill",
          "q": "外側のループごと抜けるには、ループに ＿＿ を付けて break outer; のように書く",
          "a": "ラベル",
          "wrong": [
            "アノテーション",
            "修飾子",
            "コメント"
          ],
          "explain": "ラベルはループ以外の文やブロックにも付けられ、その場合は break だけが使える（continue はループ専用）。"
        },
        {
          "type": "fill",
          "q": "拡張 for 文の ＿＿ に入る記号は？",
          "code": "int[] a = {1, 2, 3};\nfor (int x ＿＿ a) {\n  System.out.print(x);\n}",
          "a": ":",
          "wrong": [
            "in",
            ";",
            "->"
          ],
          "explain": "Java の拡張 for はコロンを使い、in というキーワードはない。配列のほか、Iterable を実装したリストなども回せる。"
        },
        {
          "type": "fill",
          "q": "ソート済みの配列から値を高速に探すメソッドは Arrays.＿＿",
          "a": "binarySearch",
          "wrong": [
            "search",
            "find",
            "indexOf"
          ],
          "explain": "二分探索なので、ソートしていない配列に使うと結果は不定（正しい保証がない）。重複した値があると、どれの位置が返るかも決まっていない。"
        },
        {
          "type": "fill",
          "q": "2つの配列で最初に異なる要素の位置を返すメソッドは Arrays.＿＿（Java 9〜）",
          "a": "mismatch",
          "wrong": [
            "compare",
            "diff",
            "equals"
          ],
          "explain": "完全に一致すれば -1 を返す。compare は大小を数値で、equals は一致かどうかを boolean で返す。"
        },
        {
          "type": "match",
          "q": "配列の型と要素の既定値を結べ",
          "pairs": [
            [
              "int[]",
              "0"
            ],
            [
              "boolean[]",
              "false"
            ],
            [
              "double[]",
              "0.0"
            ],
            [
              "String[]",
              "null"
            ]
          ],
          "explain": "char[] の既定値は \\u0000（文字コード0の見えない文字）。参照型の配列は全部 null から始まる。"
        },
        {
          "type": "match",
          "q": "キーワード・構文と働きを結べ",
          "pairs": [
            [
              "break",
              "ループを抜ける"
            ],
            [
              "continue",
              "次の繰り返しへ"
            ],
            [
              "do-while",
              "最低1回は実行"
            ],
            [
              "拡張for",
              "全要素を順に処理"
            ]
          ],
          "explain": "continue は for 文では更新式（i++ など）に進んでから条件判定に移る。while 文では直接条件判定に戻る。"
        },
        {
          "type": "match",
          "q": "Arrays のメソッドと働きを結べ",
          "pairs": [
            [
              "sort",
              "昇順に並べ替え"
            ],
            [
              "toString",
              "[1, 2] の形の文字列"
            ],
            [
              "equals",
              "要素ごとに比較"
            ],
            [
              "fill",
              "全要素を同じ値に"
            ]
          ],
          "explain": "Arrays は java.util パッケージなので import が必要。多次元配列の中身を表示するなら deepToString を使う。"
        },
        {
          "type": "order",
          "q": "基本の for 文で、1周目に処理される順に並べよ",
          "items": [
            "初期化",
            "条件判定",
            "本体",
            "更新式"
          ],
          "explain": "初期化は最初の1回だけ。2周目以降は「更新式 → 条件判定 → 本体」がくり返される。"
        },
        {
          "type": "order",
          "q": "{\"b\", \"B\", \"a\", \"1\"} を Arrays.sort した後の並びを順に並べよ",
          "items": [
            "1",
            "B",
            "a",
            "b"
          ],
          "explain": "文字コード順で、数字（0x30〜）→ 大文字（0x41〜）→ 小文字（0x61〜）。大文字小文字を区別せずに並べたいなら String.CASE_INSENSITIVE_ORDER を渡す。"
        },
        {
          "type": "order",
          "q": "for (int i = 10; i > 0; i /= 3) System.out.print(i); で出力される値を順に並べよ",
          "items": [
            "10",
            "3",
            "1"
          ],
          "explain": "10 / 3 = 3、3 / 3 = 1、1 / 3 = 0 で条件が false になり終了。整数除算なので小数は出ない。"
        },
        {
          "type": "multi",
          "q": "コンパイルできる配列の宣言を全て選べ",
          "options": [
            "int a[] = new int[2];",
            "int[] a = {1, 2};",
            "int[] a = new int[]{1, 2};",
            "int[2] a;",
            "int a[] = new int[];",
            "int[] a = new int[2]{1, 2};"
          ],
          "correct": [
            "int a[] = new int[2];",
            "int[] a = {1, 2};",
            "int[] a = new int[]{1, 2};"
          ],
          "explain": "宣言の型の部分には長さを書けない。new で作るときは「長さ」か「初期化子」のどちらか一方だけを書く。"
        },
        {
          "type": "multi",
          "q": "コンパイルエラーになる for 文を全て選べ",
          "options": [
            "for (int i = 0, j = 0; i < 3; i++) {}",
            "for (int i = 0, int j = 0; ; ) {}",
            "for (;;) {}",
            "for (int i = 0, long j = 0; ; ) {}",
            "for (int i = 0; ; i++) {}"
          ],
          "correct": [
            "for (int i = 0, int j = 0; ; ) {}",
            "for (int i = 0, long j = 0; ; ) {}"
          ],
          "explain": "初期化部で複数の変数を宣言するなら、型は先頭に1回だけ書き、全部同じ型にする。int と long を混ぜることはできない。"
        },
        {
          "type": "multi",
          "q": "Java 17 でプログラムの起動（エントリポイント）に使える main を全て選べ",
          "options": [
            "public static void main(String[] args)",
            "public static void main(String... a)",
            "static public void main(String args[])",
            "public void main(String[] args)",
            "public static int main(String[] args)"
          ],
          "correct": [
            "public static void main(String[] args)",
            "public static void main(String... a)",
            "static public void main(String args[])"
          ],
          "explain": "public と static の順番や引数名は自由だが、戻り値は void でなければならない。static のない main は Java 17 ではエントリポイントにならない。"
        },
        {
          "type": "multi",
          "q": "配列の操作で実行時に起こりうる例外を全て選べ",
          "options": [
            "ArrayIndexOutOfBoundsException",
            "ArrayStoreException",
            "NegativeArraySizeException",
            "ArrayFullException",
            "ArrayCastException"
          ],
          "correct": [
            "ArrayIndexOutOfBoundsException",
            "ArrayStoreException",
            "NegativeArraySizeException"
          ],
          "explain": "new int[-1] は NegativeArraySizeException。ArrayFullException や ArrayCastException という例外は存在しない。"
        }
      ],
      "cliffhanger": "値と流れと配列はそろった。いよいよ Java の本丸――クラスとオブジェクト、コンストラクタと static の世界へ踏み込む。"
    },
    {
      "title": "クラスとオブジェクト",
      "icon": "🏗️",
      "story": "Java Silver では、コードを読んで「何が表示されるか」「そもそもコンパイルできるか」を見抜く問題が大半を占める。その土台がクラスの仕組みだ。コンストラクタの自動生成、初期化の順番、オーバーロードの選ばれ方、record や enum の決まりなど、うろ覚えだと必ず引っかかる罠が並ぶ。",
      "facts": [
        {
          "text": "フィールドには初期値が自動で入るが、ローカル変数には入らない",
          "detail": "int のフィールドは 0、boolean は false、参照型は null で始まる。一方メソッド内のローカル変数は、代入前に読むとコンパイルエラーになる。",
          "rarity": "N"
        },
        {
          "text": "コンストラクタを1つでも書くと、デフォルトコンストラクタは作られない",
          "detail": "引数なしのデフォルトコンストラクタは「コンストラクタを1つも書かなかった」ときだけコンパイラが用意する。そのアクセス修飾子はクラスと同じになる。",
          "rarity": "R"
        },
        {
          "text": "オーバーロードの優先順位は「拡大変換 → ボクシング → 可変長引数」",
          "detail": "コンパイラはまずボクシングも可変長引数も使わずに合うメソッドを探し、無ければボクシングを許し、最後に可変長引数を試す。Java 5 以前のコードの動きを変えないための順番だ。",
          "rarity": "SR"
        },
        {
          "text": "null の変数からでも static メソッドは呼べ、例外にならない",
          "detail": "static メソッドの呼び出しは変数の「型」だけで決まり、中身の参照は使われない。JLS（言語仕様）にも同じ趣旨の例が載っている。",
          "rarity": "SSR"
        },
        {
          "text": "Java は常に値渡し。参照型では「参照のコピー」が渡される",
          "detail": "メソッド内で引数のオブジェクトを変更すると呼び出し元にも見えるが、引数に別のオブジェクトを代入しても呼び出し元の変数は変わらない。",
          "rarity": "R"
        },
        {
          "text": "record のアクセサは getX() ではなく x()。フィールドは private final",
          "detail": "record Point(int x, int y) と書くだけで、コンストラクタ・x()・y()・equals・hashCode・toString が自動で作られる。record は暗黙的に final で、他のクラスを継承できない。",
          "rarity": "SR"
        }
      ],
      "questions": [
        {
          "type": "tf",
          "q": "次の2つのメソッドがあるとき、m(5) を呼ぶと「Integer」と表示される。",
          "code": "static void m(long x) {\n  System.out.println(\"long\");\n}\nstatic void m(Integer x) {\n  System.out.println(\"Integer\");\n}\n// main から呼び出す\nm(5);",
          "a": false,
          "explain": "表示は「long」。int→long の拡大変換は、int→Integer のボクシングより優先される。ボクシングは Java 5 で追加されたため、昔のコードの動きを変えないようこの順番になった。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "enum Color { RED, GREEN, BLUE }\n// main で\nSystem.out.println(\n  Color.BLUE.ordinal());",
          "a": 2,
          "unit": "",
          "min": 0,
          "max": 9,
          "explain": "ordinal() は宣言順の番号で、0 から始まる。enum 同士を compareTo で比べたときも、この宣言順で大小が決まる。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "static int count(int... a) {\n  return a.length;\n}\n// main で\nSystem.out.println(count());",
          "a": 0,
          "unit": "",
          "min": 0,
          "max": 5,
          "explain": "可変長引数に何も渡さないと、長さ0の配列が渡される（null ではない）。可変長引数は引数リストの最後に1つだけ書ける。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "static void inc(int x) {\n  x++;\n}\n// main で\nint n = 10;\ninc(n);\nSystem.out.println(n);",
          "a": 10,
          "unit": "",
          "min": 5,
          "max": 25,
          "explain": "メソッドには n の値のコピーが渡されるので、中で x を増やしても n は 10 のまま。参照型でも渡るのは「参照のコピー」で、Java に参照渡しはない。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "class C {\n  static int n;\n  C() { n++; }\n}\n// main で\nnew C(); new C(); new C();\nSystem.out.println(C.n);",
          "a": 3,
          "unit": "",
          "min": 0,
          "max": 10,
          "explain": "static フィールドはクラスに1つだけで、全インスタンスで共有される。初期化しなくても static int は 0 から始まる。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "class P {\n  P(int x) { }\n}\n// 別のクラスの main で\nP p = new P();",
          "a": "コンパイルエラー",
          "wrong": [
            "正常に生成される",
            "実行時に例外がスローされる",
            "x に 0 が入って生成される"
          ],
          "explain": "P(int) を書いたので、引数なしのデフォルトコンストラクタは作られない。デフォルトコンストラクタが作られるのは、コンストラクタを1つも書かなかったときだけだ。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行すると何が表示される？",
          "code": "class A {\n  static { System.out.print(\"S\"); }\n  { System.out.print(\"I\"); }\n  A() { System.out.print(\"C\"); }\n  public static void main(String[] a) {\n    new A(); new A();\n  }\n}",
          "a": "SICIC",
          "wrong": [
            "SICSIC",
            "ICSIC",
            "SIICC"
          ],
          "explain": "static 初期化ブロックはクラスが初めて使われるときに1回だけ動く。インスタンス初期化ブロックは new のたびに、コンストラクタ本体の前に実行される。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行すると何が表示される？",
          "code": "static void f(StringBuilder sb) {\n  sb.append(\"B\");\n  sb = new StringBuilder(\"X\");\n  sb.append(\"Y\");\n}\n// main で\nvar s = new StringBuilder(\"A\");\nf(s);\nSystem.out.println(s);",
          "a": "AB",
          "wrong": [
            "A",
            "XY",
            "ABXY"
          ],
          "explain": "最初の append は s と同じオブジェクトを変えるので「B」が付く。その後 sb に別のオブジェクトを入れても、それはコピーされた参照を差し替えただけで s には影響しない。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "class C {\n  int n = 5;\n  public static void main(String[] a) {\n    System.out.println(n);\n  }\n}",
          "a": "コンパイルエラー",
          "wrong": [
            "5 と表示される",
            "0 と表示される",
            "実行時に例外がスローされる"
          ],
          "explain": "static メソッドには this が無いので、インスタンスフィールド n を直接使えない。new C().n のようにインスタンスを作れば読める。"
        },
        {
          "type": "choice",
          "q": "引数なしで実行したとき、どうなる？",
          "code": "public static void main(String[] a) {\n  int x;\n  if (a.length > 0) x = 1;\n  System.out.println(x);\n}",
          "a": "コンパイルエラー",
          "wrong": [
            "0 と表示される",
            "1 と表示される",
            "実行時に例外がスローされる"
          ],
          "explain": "ローカル変数には初期値が無く、コンパイラは「必ず代入済みか」を確かめる。if だけでは代入されない道があるのでエラーになる。実行時の引数の数は関係ない。"
        },
        {
          "type": "choice",
          "q": "m(1) を呼ぶと何が表示される？",
          "code": "static void m(int... x) {\n  System.out.println(\"varargs\");\n}\nstatic void m(Object x) {\n  System.out.println(\"Object\");\n}\n// main から呼び出す\nm(1);",
          "a": "Object",
          "wrong": [
            "varargs",
            "コンパイルエラー（あいまい）",
            "実行時に例外がスローされる"
          ],
          "explain": "int→Integer→Object のボクシングで済む m(Object) が、可変長引数より先に選ばれる。可変長引数は「他に候補が無いときの最後の手段」だ。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行するとどうなる？",
          "code": "final int[] arr = {1, 2, 3};\narr[0] = 10;\nSystem.out.println(arr[0]);",
          "a": "10 と表示される",
          "wrong": [
            "1 と表示される",
            "コンパイルエラー",
            "実行時に例外がスローされる"
          ],
          "explain": "final が禁止するのは変数 arr への再代入だけで、配列の中身は変えられる。arr = new int[5]; と書くとコンパイルエラーになる。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行すると何が表示される？",
          "code": "record Point(int x, int y) { }\n// main で\nvar p = new Point(3, 4);\nSystem.out.println(p.x() + p.y());",
          "a": "7",
          "wrong": [
            "34",
            "コンパイルエラー",
            "Point[x=3, y=4]"
          ],
          "explain": "record のアクセサはコンポーネント名そのまま x()・y() で、int 同士の足し算になる。getX() という名前のメソッドは作られない。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行すると何が表示される？",
          "code": "record Age(int v) {\n  Age {\n    if (v < 0) v = 0;\n  }\n}\n// main で\nSystem.out.println(new Age(-5).v());",
          "a": "0",
          "wrong": [
            "-5",
            "コンパイルエラー",
            "実行時に例外がスローされる"
          ],
          "explain": "Age { } はコンパクトコンストラクタ。中で書き換えられるのは引数 v で、本体の最後にその値がフィールドへ自動で代入される。引数チェックや補正を書く場所として使う。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行すると何が表示される？",
          "code": "enum Size { S, M, L }\n// main で\nSize s = Size.M;\nswitch (s) {\n  case S: System.out.print(\"小\");\n  case M: System.out.print(\"中\");\n  case L: System.out.print(\"大\");\n}",
          "a": "中大",
          "wrong": [
            "中",
            "小中大",
            "コンパイルエラー"
          ],
          "explain": "break が無いので case M から下へ「フォールスルー」する。Java 17 では enum の case ラベルは Size.M ではなく M と定数名だけで書く。"
        },
        {
          "type": "choice",
          "q": "new A() を実行すると何が表示される？",
          "code": "class A {\n  A() {\n    this(1);\n    System.out.print(\"X\");\n  }\n  A(int n) {\n    System.out.print(\"Y\" + n);\n  }\n}",
          "a": "Y1X",
          "wrong": [
            "XY1",
            "X",
            "コンパイルエラー"
          ],
          "explain": "this(1) で先に A(int) が動き、戻ってから「X」が出る。this(...) はコンストラクタの先頭にしか書けず、super(...) と同時には使えない。"
        },
        {
          "type": "choice",
          "q": "import 文を書かずに使えるクラスはどれ？",
          "a": "java.lang.Math",
          "wrong": [
            "java.util.List",
            "java.util.Scanner",
            "java.io.File"
          ],
          "explain": "java.lang パッケージ（String・Math・System など）だけは自動で import される。ただし java.lang.reflect のようなサブパッケージは含まれない。"
        },
        {
          "type": "choice",
          "q": "4行目の後、GC（ガベージコレクション）の対象になるのは？",
          "code": "Object a = new Object(); // 1つ目\nObject b = new Object(); // 2つ目\na = b;\nb = null;",
          "a": "1つ目のオブジェクトだけ",
          "wrong": [
            "2つ目のオブジェクトだけ",
            "両方",
            "どちらも対象にならない"
          ],
          "explain": "1つ目はどの変数からも参照されなくなった。2つ目は a がまだ指している。対象になっても「いつ回収されるか」はJVM次第で、System.gc() も保証にはならない。"
        },
        {
          "type": "choice",
          "q": "トップレベル（ファイル直下）のクラスに付けられるアクセス修飾子は？",
          "a": "public か、修飾子なし",
          "wrong": [
            "public・protected・private の3つ",
            "private のみ",
            "どの修飾子でも付けられる"
          ],
          "explain": "トップレベルクラスは public かパッケージプライベートだけ。public クラスは1ファイルに1つまでで、ファイル名とクラス名を一致させる必要がある。"
        },
        {
          "type": "choice",
          "q": "Outer の外にある main から Inner のインスタンスを作る正しい書き方は？",
          "code": "class Outer {\n  class Inner { }\n}",
          "a": "new Outer().new Inner()",
          "wrong": [
            "new Outer.Inner()",
            "Outer.new Inner()",
            "new Inner(new Outer())"
          ],
          "explain": "内部クラス（static でないネストクラス）は外側のインスタンスにひも付くので、外側を先に作る。static class Inner なら new Outer.Inner() で作れる。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "int n = 1;\nn++;\nRunnable r = new Runnable() {\n  public void run() {\n    System.out.println(n);\n  }\n};",
          "a": "コンパイルエラー",
          "wrong": [
            "1 と表示される",
            "2 と表示される",
            "実行時に例外がスローされる"
          ],
          "explain": "匿名クラスやローカルクラスから使えるローカル変数は、final か「実質的 final（一度も再代入されない）」なものだけ。n++ で再代入しているのでエラーになる。"
        },
        {
          "type": "tf",
          "q": "このコードはコンパイルできる。",
          "code": "record Age(int v) {\n  Age {\n    this.v = v;\n  }\n}",
          "a": false,
          "explain": "コンパクトコンストラクタではフィールドに代入できず、コンパイルエラーになる。代入は本体の最後に自動で行われるからだ。引数を明示する正規コンストラクタ Age(int v) { this.v = v; } なら書ける。"
        },
        {
          "type": "tf",
          "q": "record は extends で他のクラスを継承できない。",
          "a": true,
          "explain": "record は暗黙的に java.lang.Record を継承し、さらに final なので継承もされない。ただしインタフェースは implements できる。"
        },
        {
          "type": "tf",
          "q": "enum のコンストラクタに public を付けることができる。",
          "a": false,
          "explain": "enum のコンストラクタは private か修飾子なし（暗黙で private）だけで、public や protected はコンパイルエラー。外から new で定数を増やせないようにするためだ。"
        },
        {
          "type": "tf",
          "q": "this(...) と super(...) は、1つのコンストラクタの中に両方書ける。",
          "a": false,
          "explain": "どちらも「コンストラクタの最初の文」でなければならないので、同時には書けない。this(...) で呼んだ先のコンストラクタが super(...) を呼ぶ形になる。"
        },
        {
          "type": "tf",
          "q": "実行すると NullPointerException が発生する。",
          "code": "class C {\n  static void hi() {\n    System.out.println(\"hi\");\n  }\n}\n// main で\nC c = null;\nc.hi();",
          "a": false,
          "explain": "「hi」と表示される。static メソッドは変数の型 C だけで呼び先が決まり、中身の null は使われない。紛らわしいので普通は C.hi() と書く。"
        },
        {
          "type": "tf",
          "q": "java.lang パッケージのクラスは、import 文なしで使える。",
          "a": true,
          "explain": "String や System、Integer などがこれにあたる。同じ名前のクラスを自分で作ると、自分のクラスが優先される点に注意。"
        },
        {
          "type": "tf",
          "q": "import java.util.*; と書くと、java.util.function パッケージのクラスも使えるようになる。",
          "a": false,
          "explain": "* は「そのパッケージ直下の型」だけを読み込み、サブパッケージは含まない。java.util.function.* を別に書く必要がある。"
        },
        {
          "type": "tf",
          "q": "final のインスタンスフィールドは、宣言時・初期化ブロック・コンストラクタのどこかで、ちょうど1回代入しなければならない。",
          "a": true,
          "explain": "代入し忘れても2回代入してもコンパイルエラー。final フィールドだけには、自動の初期値（0 や null）が使われない。"
        },
        {
          "type": "tf",
          "q": "次のコードは「JAVA」と表示する。",
          "code": "String s = \"java\";\ns.toUpperCase();\nSystem.out.println(s);",
          "a": false,
          "explain": "表示は「java」。String はイミュータブル（不変）で、toUpperCase() は新しい文字列を返すだけ。s = s.toUpperCase(); と受け取る必要がある。"
        },
        {
          "type": "tf",
          "q": "インスタンスメソッドの中から static フィールドを参照できる。",
          "a": true,
          "explain": "逆向き（static からインスタンスへ）はできないが、インスタンス側からクラス共通のものは自由に使える。static はインスタンスが無くても存在するからだ。"
        },
        {
          "type": "order",
          "q": "クラスを初めて new したときに実行される順に並べよ",
          "items": [
            "static 初期化ブロック",
            "super() による親のコンストラクタ",
            "インスタンス初期化ブロック",
            "コンストラクタ本体の残り"
          ],
          "explain": "static はクラスの準備で最初に1回。インスタンス初期化ブロックやフィールドの初期化子は、super() が終わった直後・コンストラクタ本体の前に動く。"
        },
        {
          "type": "order",
          "q": "Java ソースファイルに書く順に並べよ",
          "items": [
            "package 文",
            "import 文",
            "クラス宣言"
          ],
          "explain": "package 文はコメントを除いて先頭に1つだけ。省略すると「無名パッケージ」に属する。import 文はいくつでも書ける。"
        },
        {
          "type": "order",
          "q": "オブジェクトの一生を順に並べよ",
          "items": [
            "new でヒープに作られる",
            "変数から参照されて使われる",
            "どこからも参照されなくなる",
            "GC によって回収される"
          ],
          "explain": "参照が無くなったオブジェクトは「GC の対象」になるが、すぐ回収されるとは限らない。回収されないままプログラムが終わることもある。"
        },
        {
          "type": "fill",
          "q": "record Book(String name) で自動生成されるアクセサメソッドは ＿＿ である",
          "a": "name()",
          "wrong": [
            "getName()",
            "getname()",
            "name"
          ],
          "explain": "record のアクセサはコンポーネント名と同じ名前で、public になる。自分で書き直すことも可能だが、そのときも public でなければならない。"
        },
        {
          "type": "fill",
          "q": "コンストラクタの中で、同じクラスの別のコンストラクタを呼ぶには先頭に ＿＿ と書く",
          "a": "this(...)",
          "wrong": [
            "super(...)",
            "self(...)",
            "new(...)"
          ],
          "explain": "this(...) で引数の少ないコンストラクタから多いものへ処理をまとめるのが定番。自分自身を呼び返す循環はコンパイルエラーになる。"
        },
        {
          "type": "fill",
          "q": "Math.PI を PI と書けるようにするには import ＿＿ java.lang.Math.PI; と書く",
          "a": "static",
          "wrong": [
            "final",
            "public",
            "const"
          ],
          "explain": "static import は static なフィールドやメソッドを、クラス名なしで使えるようにする。語順は「import static」で、「static import」と書くとコンパイルエラー。"
        },
        {
          "type": "fill",
          "q": "宣言したクラスの中だけに公開を限定するアクセス修飾子は ＿＿",
          "a": "private",
          "wrong": [
            "protected",
            "final",
            "static"
          ],
          "explain": "フィールドを private にしてメソッド経由で読み書きさせるのがカプセル化。同じクラスなら、別のインスタンスの private フィールドにもアクセスできる。"
        },
        {
          "type": "fill",
          "q": "enum の全定数を宣言順の配列で返す static メソッドは ＿＿",
          "a": "values()",
          "wrong": [
            "list()",
            "getAll()",
            "ordinals()"
          ],
          "explain": "values() はコンパイラが自動で追加するメソッド。名前から定数を得る valueOf(\"RED\") も同じく自動で作られる。"
        },
        {
          "type": "match",
          "q": "アクセス修飾子と、アクセスできる範囲を結べ",
          "pairs": [
            [
              "public",
              "どこからでも"
            ],
            [
              "protected",
              "同パッケージ＋サブクラス"
            ],
            [
              "修飾子なし",
              "同じパッケージのみ"
            ],
            [
              "private",
              "同じクラスのみ"
            ]
          ],
          "explain": "広い順に public → protected → なし → private。protected は「サブクラス限定」ではなく、同じパッケージにも公開される点がよく問われる。"
        },
        {
          "type": "match",
          "q": "フィールドの型と、自動で入る初期値を結べ",
          "pairs": [
            [
              "int",
              "0"
            ],
            [
              "boolean",
              "false"
            ],
            [
              "double",
              "0.0"
            ],
            [
              "String",
              "null"
            ]
          ],
          "explain": "配列の要素も同じ初期値で埋まる。new int[3] は {0, 0, 0}、new String[3] は {null, null, null} だ。"
        },
        {
          "type": "match",
          "q": "ネストクラスの種類と特徴を結べ",
          "pairs": [
            [
              "static ネストクラス",
              "外側インスタンス不要"
            ],
            [
              "内部クラス",
              "外側インスタンスが必要"
            ],
            [
              "ローカルクラス",
              "メソッド内で宣言"
            ],
            [
              "匿名クラス",
              "名前なしで宣言と生成"
            ]
          ],
          "explain": "内部クラスからは外側のインスタンスフィールドを直接使える。匿名クラスはインタフェースをその場で実装したいときに便利で、後のラムダ式の前身でもある。"
        },
        {
          "type": "multi",
          "q": "record について正しいものを全て選べ",
          "options": [
            "暗黙的に final である",
            "extends で他のクラスを継承できる",
            "アクセサは getX() という名前になる",
            "インタフェースを implements できる",
            "static フィールドは宣言できる"
          ],
          "correct": [
            "暗黙的に final である",
            "インタフェースを implements できる",
            "static フィールドは宣言できる"
          ],
          "explain": "record にはコンポーネント以外のインスタンスフィールドを追加できないが、static フィールドやメソッドは自由に書ける。"
        },
        {
          "type": "multi",
          "q": "enum について正しいものを全て選べ",
          "options": [
            "values() で全定数の配列が得られる",
            "new で新しい定数を作れる",
            "コンストラクタは暗黙的に private",
            "ordinal() は 1 から始まる",
            "フィールドやメソッドを持てる"
          ],
          "correct": [
            "values() で全定数の配列が得られる",
            "コンストラクタは暗黙的に private",
            "フィールドやメソッドを持てる"
          ],
          "explain": "enum もクラスの一種なので、フィールド・コンストラクタ・メソッドを持てる。ordinal() は 0 始まりだ。"
        },
        {
          "type": "multi",
          "q": "「// ここに書く」の位置に書いてコンパイルできるものを全て選べ",
          "code": "class C {\n  int n;\n  void f() { }\n  public static void main(String[] a) {\n    // ここに書く\n  }\n}",
          "options": [
            "System.out.println(n);",
            "f();",
            "new C().f();",
            "System.out.println(new C().n);",
            "this.f();"
          ],
          "correct": [
            "new C().f();",
            "System.out.println(new C().n);"
          ],
          "explain": "static な main にはインスタンスが無いので、n・f()・this は使えない。インスタンスを作ってから呼べば OK。"
        },
        {
          "type": "multi",
          "q": "同じクラスに両方書いても正しいオーバーロードになる組を全て選べ",
          "options": [
            "void m(int a) と void m(long a)",
            "void m(int a) と int m(int b)",
            "void m(int a) と void m(int... a)",
            "void m(String s) と void m(String t)",
            "void m() と void m(int a)"
          ],
          "correct": [
            "void m(int a) と void m(long a)",
            "void m(int a) と void m(int... a)",
            "void m() と void m(int a)"
          ],
          "explain": "オーバーロードは「引数の型・数・並び」が違う必要がある。戻り値の型や引数の名前だけが違う場合は、同じメソッドの二重定義としてコンパイルエラー。"
        }
      ],
      "cliffhanger": "クラスを1つ作れるようになったら、次はクラスを親子でつなぐ番だ。継承とポリモーフィズムの世界では、「変数の型」と「中身の型」のずれが新たな罠を生む。"
    },
    {
      "title": "継承・ポリモーフィズム・インタフェース",
      "icon": "🧬",
      "story": "継承の問題は Java Silver の山場だ。「親の型の変数に子のオブジェクトを入れたとき、どちらのメソッドが動くか」「オーバーライドのルール違反でコンパイルエラーになるか」がくり返し問われる。Java 17 で正式に入った sealed クラスや、インタフェースの default メソッドも出題範囲に含まれる。",
      "facts": [
        {
          "text": "クラスの継承は1つだけ。インタフェースはいくつでも実装できる",
          "detail": "class C extends P implements A, B のように書く。インタフェース同士は extends で複数継承できる。",
          "rarity": "N"
        },
        {
          "text": "親に引数なしコンストラクタが無いと、子の暗黙の super() でエラー",
          "detail": "コンストラクタの先頭に this(...) も super(...) も書かないと、コンパイラが super(); を自動で入れる。親にそれが無ければコンパイルエラーになる。",
          "rarity": "R"
        },
        {
          "text": "フィールドと static メソッドはポリモーフィズムしない",
          "detail": "動的に（中身の型で）選ばれるのはインスタンスメソッドだけ。フィールドと static メソッドは、変数の宣言された型で決まる「隠蔽（ハイディング）」になる。",
          "rarity": "SR"
        },
        {
          "text": "親のコンストラクタが呼んだメソッドも子の実装が動き、子のフィールドはまだ 0",
          "detail": "オーバーライドされたメソッドは、親のコンストラクタの中からでも子の版が呼ばれる。子のフィールドの初期化は親のコンストラクタの後なので、まだ初期値のままだ。",
          "rarity": "SSR"
        },
        {
          "text": "オーバーライドで公開範囲は狭められず、検査例外は広げられない",
          "detail": "親が public なら子も public。親の throws に無い検査例外を新しく throws するとコンパイルエラー。戻り値はサブクラスの型に変えてよい（共変戻り値）。",
          "rarity": "R"
        },
        {
          "text": "sealed クラスの子は final・sealed・non-sealed のどれかが必須",
          "detail": "sealed は Java 17 で正式機能になった。permits で継承を許すクラスを限定でき、同じファイルに子クラスを書くなら permits を省略できる。",
          "rarity": "SR"
        }
      ],
      "questions": [
        {
          "type": "tf",
          "q": "このコードは「C」と表示する。",
          "code": "class P { String name = \"P\"; }\nclass C extends P {\n  String name = \"C\";\n}\n// main で\nP p = new C();\nSystem.out.println(p.name);",
          "a": false,
          "explain": "表示は「P」。フィールドはオーバーライドされず、変数 p の宣言された型 P のものが使われる。同じ名前のフィールドを子に書くと、親のものを「隠す」だけだ。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "class P {\n  int v() { return 1; }\n}\nclass C extends P {\n  int v() { return 10; }\n}\n// main で\nP p = new C();\nSystem.out.println(p.v() + p.v());",
          "a": 20,
          "unit": "",
          "min": 0,
          "max": 50,
          "explain": "インスタンスメソッドは中身の型 C の v() が動くので 10 + 10。どのメソッドが動くかを実行時に決めることを「動的バインディング」と呼ぶ。"
        },
        {
          "type": "number",
          "q": "main で次を実行したとき、表示される値は？",
          "code": "class P {\n  int x = 1;\n  int get() { return x; }\n}\nclass C extends P {\n  int x = 100;\n  int get() { return x; }\n}\nP p = new C();\nSystem.out.println(p.x + p.get());",
          "a": 101,
          "unit": "",
          "min": 0,
          "max": 300,
          "explain": "p.x はフィールドなので型 P の 1、p.get() はオーバーライドされた C 側が動いて C の x＝100 を返す。合計 101。フィールドとメソッドの違いが一度に問われる定番問題だ。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "class P {\n  static int id() { return 1; }\n}\nclass C extends P {\n  static int id() { return 2; }\n}\n// main で\nP p = new C();\nSystem.out.println(p.id() * 10);",
          "a": 10,
          "unit": "",
          "min": 0,
          "max": 30,
          "explain": "static メソッドはオーバーライドされず「隠蔽」になり、変数の型 P の id() が呼ばれる。static メソッドに @Override を付けるとコンパイルエラーになる。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "interface I { int N = 5; }\nclass A implements I { }\n// main で\nSystem.out.println(A.N + I.N);",
          "a": 10,
          "unit": "",
          "min": 0,
          "max": 15,
          "explain": "インタフェースのフィールドは暗黙的に public static final の定数で、実装クラス経由でも参照できる。値を書き換えようとするとコンパイルエラーになる。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "class P {\n  P(String s) { }\n}\nclass C extends P {\n  C() { }\n}",
          "a": "コンパイルエラー",
          "wrong": [
            "正常にコンパイルできる",
            "実行時に例外がスローされる",
            "P の s に null が渡される"
          ],
          "explain": "C() の先頭には super(); が自動で入るが、P に引数なしコンストラクタが無い。C() { super(\"x\"); } のように明示すれば直る。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行するとどうなる？",
          "code": "Object o = \"hello\";\nInteger i = (Integer) o;\nSystem.out.println(i);",
          "a": "実行時に例外がスローされる",
          "wrong": [
            "hello と表示される",
            "コンパイルエラー",
            "null と表示される"
          ],
          "explain": "Object から Integer へのキャストは「あり得る」のでコンパイルは通るが、中身は String なので ClassCastException になる。instanceof で先に確かめるのが安全だ。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "String s = \"hello\";\nInteger i = (Integer) s;",
          "a": "コンパイルエラー",
          "wrong": [
            "実行時に例外がスローされる",
            "i に null が入る",
            "正常に動作する"
          ],
          "explain": "String と Integer はクラス同士で継承関係が無いので、変換は絶対にあり得ない。コンパイラが見抜けるキャストの誤りは、実行前にエラーになる。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "class P {\n  public void m() { }\n}\nclass C extends P {\n  void m() { }\n}",
          "a": "コンパイルエラー",
          "wrong": [
            "正常にコンパイルできる",
            "実行時に例外がスローされる",
            "C の m() は別メソッド扱いになる"
          ],
          "explain": "オーバーライドで public をパッケージプライベートに狭めることはできない。親の型として使ったとき、呼べるはずのメソッドが呼べなくなってしまうからだ。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "abstract class Shape {\n  abstract double area();\n}\nclass Sq extends Shape { }",
          "a": "Sq の宣言がコンパイルエラーになる",
          "wrong": [
            "Shape の宣言がコンパイルエラーになる",
            "正常にコンパイルできる",
            "実行時に AbstractMethodError になる"
          ],
          "explain": "具象クラス（abstract でないクラス）は、継承した抽象メソッドを全て実装しなければならない。Sq も abstract にすれば実装を先送りできる。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "interface A {\n  default void hi() { }\n}\ninterface B {\n  default void hi() { }\n}\nclass C implements A, B { }",
          "a": "コンパイルエラー",
          "wrong": [
            "A の hi() が使われる",
            "B の hi() が使われる",
            "実行時に例外がスローされる"
          ],
          "explain": "同じシグネチャの default メソッドが2つ届くと、どちらを使うか決められない（ダイヤモンド問題）。C で hi() をオーバーライドすれば解決する。"
        },
        {
          "type": "choice",
          "q": "インタフェース A と B はどちらも default String hi() を持ち、A は \"A\"、B は \"B\" を返す。表示されるのは？",
          "code": "class C implements A, B {\n  public String hi() {\n    return B.super.hi() + \"C\";\n  }\n}\n// main で\nSystem.out.println(new C().hi());",
          "a": "BC",
          "wrong": [
            "AC",
            "C",
            "コンパイルエラー"
          ],
          "explain": "「インタフェース名.super.メソッド()」で、指定したインタフェースの default 実装を呼べる。クラスの super.hi() とは書き方が違うので注意。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行すると何が表示される？",
          "code": "static String m(Object o) {\n  return \"Object\";\n}\nstatic String m(String s) {\n  return \"String\";\n}\n// main で\nObject o = \"hi\";\nSystem.out.println(m(o));",
          "a": "Object",
          "wrong": [
            "String",
            "コンパイルエラー",
            "実行時に例外がスローされる"
          ],
          "explain": "オーバーロードはコンパイル時に「変数の型」で選ばれるので、o の型 Object 用が呼ばれる。実行時に中身で選ばれるのはオーバーライドの方だ。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行すると何が表示される？",
          "code": "class P {\n  String hi() { return \"P\"; }\n}\nclass C extends P {\n  String hi() {\n    return super.hi() + \"C\";\n  }\n}\n// main で\nSystem.out.println(new C().hi());",
          "a": "PC",
          "wrong": [
            "C",
            "CP",
            "P"
          ],
          "explain": "super.hi() で親の実装を呼べる。ただし super.super.hi() のように祖父母のメソッドを直接呼ぶことはできない。"
        },
        {
          "type": "choice",
          "q": "new C() を実行すると何が表示される？",
          "code": "class P {\n  P() { show(); }\n  void show() { System.out.print(\"P\"); }\n}\nclass C extends P {\n  int x = 5;\n  void show() { System.out.print(x); }\n}",
          "a": "0",
          "wrong": [
            "5",
            "P",
            "コンパイルエラー"
          ],
          "explain": "親のコンストラクタから呼んだ show() でも、オーバーライドした C の版が動く。このとき C のフィールド初期化（x = 5）はまだなので、x は 0 のままだ。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行すると何が表示される？",
          "code": "Object o = \"Java\";\nif (o instanceof String s) {\n  System.out.println(s.length());\n}",
          "a": "4",
          "wrong": [
            "Java",
            "コンパイルエラー",
            "0"
          ],
          "explain": "Java 16 で正式になった instanceof のパターンマッチング。判定が true のとき、キャスト済みの変数 s がその場で使える。"
        },
        {
          "type": "choice",
          "q": "class MyStr extends String { } をコンパイルするとどうなる？",
          "a": "コンパイルエラー",
          "wrong": [
            "正常にコンパイルできる",
            "実行時に例外がスローされる",
            "警告だけ出てコンパイルできる"
          ],
          "explain": "String は final クラスなので継承できない。Integer などのラッパークラスも final で、文字列や数値の不変性を守っている。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "sealed class Shape permits Circle { }\nclass Circle extends Shape { }",
          "a": "コンパイルエラー",
          "wrong": [
            "正常にコンパイルできる",
            "Circle が自動で final になる",
            "実行時に例外がスローされる"
          ],
          "explain": "sealed クラスを継承するクラスは final・sealed・non-sealed のどれかを必ず付ける。ただし record と enum は暗黙的に final なので付けなくてよい。"
        },
        {
          "type": "choice",
          "q": "equals() が true を返す2つのオブジェクトについて、規約上必ず成り立つのは？",
          "a": "hashCode() が同じ値を返す",
          "wrong": [
            "hashCode() が異なる値を返す",
            "toString() が同じ文字列を返す",
            "== でも true になる"
          ],
          "explain": "equals をオーバーライドしたら hashCode も合わせて直すのが規約。逆に hashCode が同じでも equals が true とは限らない（ハッシュの衝突）。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行すると何が表示される？",
          "code": "class P {\n  int v;\n  P(int v) { this.v = v; }\n}\n// main で\nvar a = new P(1);\nvar b = new P(1);\nSystem.out.println(a.equals(b));",
          "a": "false",
          "wrong": [
            "true",
            "コンパイルエラー",
            "1"
          ],
          "explain": "Object の equals は == と同じく「同じオブジェクトか」を比べるだけ。中身で比べたいならオーバーライドが必要で、record なら自動で中身比較になる。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行すると何が表示される？",
          "code": "class P {\n  public boolean equals(P p) {\n    return true;\n  }\n}\n// main で\nObject o = new P();\nSystem.out.println(o.equals(new P()));",
          "a": "false",
          "wrong": [
            "true",
            "コンパイルエラー",
            "実行時に例外がスローされる"
          ],
          "explain": "equals(P) は引数の型が違うのでオーバーライドではなくオーバーロード。型 Object の変数からは equals(Object) が選ばれ、Object の実装が動く。@Override を付けていればコンパイルエラーで気づけた。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "interface I {\n  static String m() { return \"I\"; }\n}\nclass A implements I { }\n// main で\nSystem.out.println(A.m());",
          "a": "コンパイルエラー",
          "wrong": [
            "I と表示される",
            "null と表示される",
            "実行時に例外がスローされる"
          ],
          "explain": "インタフェースの static メソッドは実装クラスに継承されず、I.m() としか呼べない。クラスの static メソッドが子クラス名でも呼べるのとは違う。"
        },
        {
          "type": "tf",
          "q": "abstract クラスにもコンストラクタを定義できる。",
          "a": true,
          "explain": "抽象クラス自体は new できないが、子クラスの super(...) から呼ばれる。共通フィールドの初期化を親にまとめるのに使う。"
        },
        {
          "type": "tf",
          "q": "親の private メソッドと同じ名前・引数のメソッドを子に書くと、オーバーライドになる。",
          "a": false,
          "explain": "private メソッドは子に継承されないので、子のメソッドは無関係な新しいメソッドになる。そこに @Override を付けるとコンパイルエラーだ。"
        },
        {
          "type": "tf",
          "q": "親の static メソッドを、子でインスタンスメソッド（static なし）として書き直せる。",
          "a": false,
          "explain": "static とインスタンスの入れ替えはどちら向きもコンパイルエラー。static 同士なら「隠蔽」、インスタンス同士なら「オーバーライド」になる。"
        },
        {
          "type": "tf",
          "q": "このコードはコンパイルエラーになる。",
          "code": "interface I { void run(); }\nclass A implements I {\n  void run() { }\n}",
          "a": true,
          "explain": "インタフェースの抽象メソッドは暗黙的に public なので、実装側も public が必須。付け忘れると「アクセス権を弱めた」としてエラーになる。"
        },
        {
          "type": "tf",
          "q": "クラスは extends で1つ、implements で複数を同時に指定できる。",
          "a": true,
          "explain": "書く順番は extends が先、implements が後。クラスの多重継承を禁じているのは、同じフィールドや実装が複数の親から届く混乱を避けるためだ。"
        },
        {
          "type": "tf",
          "q": "null instanceof Object は true になる。",
          "a": false,
          "explain": "null はどの型のインスタンスでもないので、instanceof は常に false。例外にはならないので、null チェックを兼ねられる。"
        },
        {
          "type": "tf",
          "q": "親で Object を返すメソッドを、子で String を返すようにオーバーライドできる。",
          "a": true,
          "explain": "戻り値を子の型に狭めるのは「共変戻り値」として許される。ただし int を long にするような基本データ型の変更は不可。"
        },
        {
          "type": "tf",
          "q": "abstract final class X { } はコンパイルできる。",
          "a": false,
          "explain": "abstract は「継承して完成させて」、final は「継承禁止」なので矛盾しコンパイルエラー。メソッドでも abstract と final・private・static は組み合わせられない。"
        },
        {
          "type": "tf",
          "q": "オーバーライドしたメソッドには、親の throws に無い RuntimeException を throws に書いてもよい。",
          "a": true,
          "explain": "制限されるのは検査例外だけで、非検査例外（RuntimeException の仲間）は自由に書ける。そもそも非検査例外は throws に書かなくても投げられる。"
        },
        {
          "type": "order",
          "q": "C extends B、B extends A のとき、new C() でコンストラクタ本体が実行される順に並べよ",
          "items": [
            "Object のコンストラクタ",
            "A のコンストラクタ本体",
            "B のコンストラクタ本体",
            "C のコンストラクタ本体"
          ],
          "explain": "呼び出しは C から始まるが、各コンストラクタは先頭で super() を呼ぶので、本体は一番上の親から順に終わっていく。全てのクラスの祖先は Object だ。"
        },
        {
          "type": "order",
          "q": "C extends P で、初めて new C() したときの実行順に並べよ（C にインスタンス初期化ブロックは無い）",
          "items": [
            "P の static 初期化",
            "C の static 初期化",
            "P のインスタンス初期化",
            "P のコンストラクタ本体",
            "C のコンストラクタ本体"
          ],
          "explain": "static は親クラスから先に準備される。インスタンス側は「親の初期化ブロック→親のコンストラクタ→子の初期化ブロック→子のコンストラクタ」の順だ。"
        },
        {
          "type": "order",
          "q": "クラス C が A を継承し、インタフェース I も実装するとき、同名メソッドの実装が優先される順に並べよ",
          "items": [
            "C 自身で定義したメソッド",
            "A から継承したメソッド",
            "I の default メソッド"
          ],
          "explain": "「クラスが勝つ」ルールで、親クラスのメソッドは default メソッドより優先される。default メソッドが後から追加されても、既存クラスの動きが変わらないための工夫だ。"
        },
        {
          "type": "fill",
          "q": "sealed クラスを継承するクラスには final・sealed・＿＿ のどれかを付ける",
          "a": "non-sealed",
          "wrong": [
            "unsealed",
            "open",
            "abstract"
          ],
          "explain": "non-sealed を付けると、そこから下は誰でも自由に継承できるようになる。ハイフン入りの予約語は Java では珍しい。"
        },
        {
          "type": "fill",
          "q": "sealed クラスで、継承を許すクラスを列挙するキーワードは ＿＿",
          "a": "permits",
          "wrong": [
            "allows",
            "extends",
            "implements"
          ],
          "explain": "sealed class Shape permits Circle, Square のように書く。許可されたクラスは Shape を直接継承し、同じパッケージ（またはモジュール）に置く必要がある。"
        },
        {
          "type": "fill",
          "q": "2つのインタフェースの default メソッドが衝突したとき、A の実装を呼ぶには A.＿＿.m() と書く",
          "a": "super",
          "wrong": [
            "this",
            "default",
            "class"
          ],
          "explain": "A.super.m() と書けるのは、A を直接実装（または継承）している場合だけ。間接的な祖先インタフェースは指定できない。"
        },
        {
          "type": "fill",
          "q": "インタフェースのフィールドは暗黙的に public static ＿＿ である",
          "a": "final",
          "wrong": [
            "abstract",
            "default",
            "volatile"
          ],
          "explain": "インタフェースには状態（インスタンスフィールド）を持たせられず、定数だけを置ける。そのため宣言時の初期化が必須だ。"
        },
        {
          "type": "fill",
          "q": "親のメソッドを正しくオーバーライドしているかコンパイラに確認させる注釈は ＿＿",
          "a": "@Override",
          "wrong": [
            "@Overload",
            "@Inherited",
            "@Super"
          ],
          "explain": "付けなくてもオーバーライドは成立するが、名前や引数の型を間違えたときにコンパイルエラーで教えてくれる。@Inherited は注釈の継承に関する別物だ。"
        },
        {
          "type": "match",
          "q": "キーワードと意味を結べ",
          "pairs": [
            [
              "extends",
              "クラスを継承する"
            ],
            [
              "implements",
              "インタフェースを実装"
            ],
            [
              "permits",
              "継承を許す型を列挙"
            ],
            [
              "non-sealed",
              "継承の制限を解く"
            ]
          ],
          "explain": "インタフェースがインタフェースを継承するときは implements ではなく extends を使う。"
        },
        {
          "type": "match",
          "q": "Object クラスのメソッドと役割を結べ",
          "pairs": [
            [
              "equals",
              "等しいかを判定"
            ],
            [
              "hashCode",
              "ハッシュ値を返す"
            ],
            [
              "toString",
              "文字列表現を返す"
            ],
            [
              "getClass",
              "実行時の型を返す"
            ]
          ],
          "explain": "toString を書き換えないと「クラス名@16進数」の形で表示される。getClass は final なので書き換えられない。"
        },
        {
          "type": "match",
          "q": "メソッドの修飾子と性質を結べ",
          "pairs": [
            [
              "abstract",
              "本体を持たない"
            ],
            [
              "final",
              "オーバーライド禁止"
            ],
            [
              "static",
              "インスタンス不要"
            ],
            [
              "private",
              "同じクラス内だけ"
            ]
          ],
          "explain": "abstract メソッドは「子に実装させる」前提なので、オーバーライドできない final・private・static とは組み合わせられない。"
        },
        {
          "type": "multi",
          "q": "C extends P で、P の get() を正しくオーバーライドできる宣言を全て選べ（本体は省略）",
          "code": "class P {\n  protected Number get()\n      throws IOException {\n    return 1;\n  }\n}",
          "options": [
            "public Integer get()",
            "protected Number get() throws FileNotFoundException",
            "Number get()",
            "protected Object get()",
            "public Number get() throws Exception"
          ],
          "correct": [
            "public Integer get()",
            "protected Number get() throws FileNotFoundException"
          ],
          "explain": "public への拡大、Integer への共変戻り値、IOException の子の FileNotFoundException は OK。修飾子なしは範囲が狭まり、Object は戻り値が広がり、Exception は例外が広がるのでエラー。"
        },
        {
          "type": "multi",
          "q": "Java 17 のインタフェースに定義できるものを全て選べ",
          "options": [
            "default メソッド",
            "static メソッド",
            "private メソッド",
            "protected メソッド",
            "インスタンスフィールド",
            "コンストラクタ"
          ],
          "correct": [
            "default メソッド",
            "static メソッド",
            "private メソッド"
          ],
          "explain": "default と static は Java 8、private メソッドは Java 9 から書ける。private メソッドは default メソッド同士の共通処理をまとめるのに使う。"
        },
        {
          "type": "multi",
          "q": "sealed クラスについて正しいものを全て選べ",
          "options": [
            "許可されたサブクラスは直接継承する必要がある",
            "サブクラスは final・sealed・non-sealed のどれかを付ける",
            "同じファイルにサブクラスがあれば permits を省略できる",
            "匿名クラスを permits に指定できる",
            "record は sealed インタフェースを実装できない"
          ],
          "correct": [
            "許可されたサブクラスは直接継承する必要がある",
            "サブクラスは final・sealed・non-sealed のどれかを付ける",
            "同じファイルにサブクラスがあれば permits を省略できる"
          ],
          "explain": "匿名クラスやローカルクラスは名前で指定できないので許可できない。record は暗黙的に final なので、sealed インタフェースの実装にぴったりだ。"
        },
        {
          "type": "multi",
          "q": "コンパイルも実行も正常に終わる文を全て選べ",
          "code": "class Animal { }\nclass Dog extends Animal { }\nclass Cat extends Animal { }",
          "options": [
            "Animal a = new Dog();",
            "Dog d = new Animal();",
            "Dog d = (Dog) new Animal();",
            "Object o = new Cat();",
            "Cat c = (Cat) new Dog();"
          ],
          "correct": [
            "Animal a = new Dog();",
            "Object o = new Cat();"
          ],
          "explain": "(Dog) new Animal() はコンパイルは通るが ClassCastException。(Cat) new Dog() は兄弟クラス間で変換があり得ないのでコンパイルエラー。キャストなしの代入は子→親の向きだけ OK。"
        }
      ],
      "cliffhanger": "クラスの設計図が描けても、プログラムは思いどおりに動くとは限らない。次はファイルが無い、0 で割った、そんなときに飛んでくる「例外」の受け止め方を学ぶ。"
    },
    {
      "title": "例外処理",
      "icon": "🧯",
      "story": "例外処理は「どの順で表示されるか」「コンパイルが通るか」を同時に問える、試験で最も意地悪な分野のひとつだ。finally の中の return、catch の並び順、try-with-resources の close の順番など、知らないと解けないルールが多い。検査例外と非検査例外の区別も、ここで一気に固めよう。",
      "facts": [
        {
          "text": "検査例外は catch するか throws で宣言しないとコンパイルエラー",
          "detail": "IOException などの検査例外は、コンパイラが処理を強制する。RuntimeException と Error の仲間は非検査例外で、何もしなくてもコンパイルできる。",
          "rarity": "N"
        },
        {
          "text": "catch はサブクラスを先に書く。逆だと到達不能でコンパイルエラー",
          "detail": "親の型の catch が先にあると、後ろの子の型の catch には絶対にたどり着けない。Java はこの「到達不能コード」をエラーにする。",
          "rarity": "R"
        },
        {
          "text": "try-with-resources は、宣言と逆の順に close する",
          "detail": "try (A a = ...; B b = ...) なら b → a の順に閉じる。catch や finally は、全てのリソースを閉じた後で実行される。",
          "rarity": "N"
        },
        {
          "text": "close() で起きた例外は「抑制された例外」として本体の例外に付く",
          "detail": "try 本体と close() の両方で例外が出たら、本体の例外が投げられ、close の例外は getSuppressed() で取り出せる。昔の finally での close では元の例外が消えてしまっていた。",
          "rarity": "SR"
        },
        {
          "text": "finally の中で return すると、try の戻り値も例外も消える",
          "detail": "try で return 1 しても、finally で return 2 すれば 2 が返る。try で例外が投げられていても、finally の return がそれを握りつぶしてしまう。",
          "rarity": "SSR"
        },
        {
          "text": "マルチキャッチの変数は暗黙的に final。親子関係の型は並べられない",
          "detail": "catch (IOException | SQLException e) のように書く。FileNotFoundException | IOException のように親子の型を並べるとコンパイルエラー。",
          "rarity": "R"
        }
      ],
      "questions": [
        {
          "type": "tf",
          "q": "このコードは「1」と表示する。",
          "code": "static int f() {\n  try {\n    return 1;\n  } finally {\n    return 2;\n  }\n}\n// main で\nSystem.out.println(f());",
          "a": false,
          "explain": "表示は「2」。finally は try の return の後でも必ず実行され、そこでの return が戻り値を上書きする。例外まで握りつぶすので、実務では finally での return は避ける。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "static int f() {\n  int x = 10;\n  try {\n    return x;\n  } finally {\n    x = 20;\n  }\n}\n// main で\nSystem.out.println(f());",
          "a": 10,
          "unit": "",
          "min": 0,
          "max": 30,
          "explain": "return x の時点で戻り値 10 が確定・保存されるので、finally で x を変えても結果は変わらない。ただし参照型の中身を finally で変えると、その変更は見える。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "int n = 0;\nfor (int i = 0; i < 4; i++) {\n  try {\n    n += 10 / (2 - i);\n  } catch (ArithmeticException e) {\n    n += 100;\n  }\n}\nSystem.out.println(n);",
          "a": 105,
          "unit": "",
          "min": 0,
          "max": 300,
          "explain": "5 + 10 で 15、i が 2 のとき 0 で割って例外になり +100、最後は 10 / -1 = -10 で 105。例外を catch すればループは止まらずに続く。"
        },
        {
          "type": "number",
          "q": "R の close() は必ず IllegalStateException をスローする。表示される値は？",
          "code": "try (R a = new R(); R b = new R()) {\n  throw new RuntimeException();\n} catch (Exception e) {\n  System.out.println(\n    e.getSuppressed().length);\n}",
          "a": 2,
          "unit": "",
          "min": 0,
          "max": 5,
          "explain": "本体の RuntimeException が主役になり、b と a の close() で出た2つの例外は抑制された例外として付く。close で例外が出ても、残りのリソースはきちんと閉じられる。"
        },
        {
          "type": "number",
          "q": "f(0); f(1); f(2); と呼んだ後、c の値は？",
          "code": "static int c = 0;\nstatic void f(int i) {\n  try {\n    if (i > 0) return;\n    c += 1;\n  } finally {\n    c += 10;\n  }\n}",
          "a": 31,
          "unit": "",
          "min": 0,
          "max": 50,
          "explain": "f(0) で 11、f(1) と f(2) は途中で return しても finally は実行されるので +10 ずつで 31。finally が実行されないのは System.exit() などで JVM が止まる場合くらいだ。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？（import は省略）",
          "code": "try {\n  new FileReader(\"a.txt\");\n} catch (IOException e) {\n} catch (FileNotFoundException e) {\n}",
          "a": "コンパイルエラー",
          "wrong": [
            "正常にコンパイルできる",
            "2つ目の catch が先に評価される",
            "実行時に例外がスローされる"
          ],
          "explain": "FileNotFoundException は IOException の子なので、1つ目の catch で必ず捕まり、2つ目には届かない。並びを逆にすれば正しいコードになる。"
        },
        {
          "type": "choice",
          "q": "次のメソッドをコンパイルするとどうなる？",
          "code": "static void read() {\n  throw new IOException();\n}",
          "a": "コンパイルエラー",
          "wrong": [
            "実行時に IOException がスローされる",
            "正常にコンパイルできる",
            "RuntimeException に変換される"
          ],
          "explain": "IOException は検査例外なので、throws IOException を宣言するか try-catch で囲む必要がある。throw は「投げる文」、throws は「投げるかもと宣言する句」だ。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行するとどうなる？",
          "code": "int z = 0;\ntry {\n  System.out.print(\"A\");\n  int x = 1 / z;\n  System.out.print(\"B\");\n} finally {\n  System.out.print(\"C\");\n}",
          "a": "「AC」と表示された後、例外で異常終了",
          "wrong": [
            "「ABC」と表示される",
            "「A」と表示された後、異常終了（C は出ない）",
            "コンパイルエラー"
          ],
          "explain": "0 で割った時点で ArithmeticException が起き、B は飛ばされる。catch が無くても finally は実行され、その後例外が呼び出し元へ伝わる。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "try {\n  Integer.parseInt(\"x\");\n} catch (NumberFormatException |\n         NullPointerException e) {\n  e = null;\n}",
          "a": "コンパイルエラー",
          "wrong": [
            "正常にコンパイルできる",
            "実行時に NullPointerException",
            "実行時に NumberFormatException"
          ],
          "explain": "マルチキャッチの変数 e は暗黙的に final なので、再代入できない。普通の（型が1つの）catch の変数なら再代入できる。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "class P {\n  void m() { }\n}\nclass C extends P {\n  void m() throws Exception { }\n}",
          "a": "コンパイルエラー",
          "wrong": [
            "正常にコンパイルできる",
            "実行時に例外がスローされる",
            "P の m() にも throws が追加される"
          ],
          "explain": "親が投げない検査例外を、オーバーライドで新たに投げることはできない。親の型として呼ぶ側が、その例外に備えていないからだ。"
        },
        {
          "type": "choice",
          "q": "main メソッドには throws 句が無い。このコードは？",
          "code": "class P {\n  void m() throws IOException { }\n}\nclass C extends P {\n  void m() { }\n}\n// main で\nP p = new C();\np.m();",
          "a": "p.m() の行がコンパイルエラー",
          "wrong": [
            "正常に動作する",
            "C の m() がコンパイルエラー",
            "実行時に IOException がスローされる"
          ],
          "explain": "C の m() は throws を減らしており正しい。しかし変数 p の型は P なので、コンパイラは P の m() の throws IOException で判断し、処理を求める。"
        },
        {
          "type": "choice",
          "q": "R は close() で自分の名前を表示する AutoCloseable。表示されるのは？",
          "code": "try (R a = new R(\"A\");\n     R b = new R(\"B\")) {\n  System.out.print(\"T\");\n} finally {\n  System.out.print(\"F\");\n}",
          "a": "TBAF",
          "wrong": [
            "TABF",
            "ABTF",
            "TFBA"
          ],
          "explain": "本体の後、後に宣言した b から先に閉じ、全部閉じてから finally が動く。後から開いたものほど先に開いたものに依存しがちなので、逆順に閉じるのが安全だ。"
        },
        {
          "type": "choice",
          "q": "R の close() は RuntimeException(\"close\") をスローする。表示されるのは？",
          "code": "try (R r = new R()) {\n  throw new IllegalStateException(\"本体\");\n} catch (Exception e) {\n  System.out.println(e.getMessage());\n}",
          "a": "本体",
          "wrong": [
            "close",
            "null",
            "本体close"
          ],
          "explain": "本体の例外が優先され、close の例外は抑制された例外として e に付くだけ。e.getSuppressed()[0].getMessage() で「close」を取り出せる。"
        },
        {
          "type": "choice",
          "q": "次のコードで、呼び出し元に伝わる例外のメッセージは？",
          "code": "try {\n  throw new RuntimeException(\"A\");\n} finally {\n  throw new RuntimeException(\"B\");\n}",
          "a": "B",
          "wrong": [
            "A",
            "A（B は抑制された例外になる）",
            "コンパイルエラーになる"
          ],
          "explain": "finally で新しい例外を投げると、元の例外 A は失われる。抑制された例外の仕組みは try-with-resources の close だけで働き、普通の finally には無い。"
        },
        {
          "type": "choice",
          "q": "f(0) を呼ぶとどうなる？",
          "code": "static int f(int n) {\n  return f(n + 1);\n}",
          "a": "StackOverflowError がスローされる",
          "wrong": [
            "OutOfMemoryError がスローされる",
            "無限に動き続けて止まらない",
            "コンパイルエラー"
          ],
          "explain": "終わりの無い再帰でメソッド呼び出しの記録（スタック）があふれる。StackOverflowError は Exception ではなく Error の仲間だ。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行するとどうなる？",
          "code": "String s = null;\nSystem.out.println(s.length());",
          "a": "NullPointerException がスローされる",
          "wrong": [
            "0 と表示される",
            "null と表示される",
            "コンパイルエラー"
          ],
          "explain": "null の変数でインスタンスメソッドを呼ぶと NullPointerException。Java 15 以降は標準で、どの変数や式が null だったかまでメッセージに出る（Helpful NullPointerExceptions）。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行するとどうなる？",
          "code": "int[] a = new int[3];\na[3] = 1;",
          "a": "ArrayIndexOutOfBoundsException がスローされる",
          "wrong": [
            "コンパイルエラー",
            "配列が自動で長さ4に伸びる",
            "NullPointerException がスローされる"
          ],
          "explain": "長さ3の配列の添字は 0〜2。コンパイラは添字の範囲を調べないので、実行してはじめて例外になる。"
        },
        {
          "type": "choice",
          "q": "main（throws 句なし）で次を書くとどうなる？",
          "code": "class MyEx extends Exception { }\n// main の中で\nthrow new MyEx();",
          "a": "コンパイルエラー",
          "wrong": [
            "実行時に MyEx がスローされる",
            "RuntimeException として扱われる",
            "何も起きない"
          ],
          "explain": "Exception を直接継承した自作例外は検査例外になる。RuntimeException を継承すれば非検査例外になり、throws 無しで投げられる。"
        },
        {
          "type": "choice",
          "q": "次のコードを実行するとどうなる？",
          "code": "try {\n  throw new StackOverflowError();\n} catch (Exception e) {\n  System.out.print(\"E\");\n} finally {\n  System.out.print(\"F\");\n}",
          "a": "「F」と表示された後、異常終了",
          "wrong": [
            "「EF」と表示される",
            "「E」と表示される",
            "コンパイルエラー"
          ],
          "explain": "Error は Exception の子ではないので catch (Exception e) では捕まらない。両方捕まえるなら共通の親 Throwable を指定するが、Error は普通は捕まえない。"
        },
        {
          "type": "choice",
          "q": "main で System.out.println(f()); を実行すると何が表示される？",
          "code": "static String f() {\n  try {\n    throw new RuntimeException();\n  } catch (RuntimeException e) {\n    return \"catch\";\n  } finally {\n    System.out.print(\"fin \");\n  }\n}",
          "a": "fin catch",
          "wrong": [
            "catch fin",
            "catch",
            "fin"
          ],
          "explain": "catch の return で戻り値「catch」が決まり、メソッドを抜ける直前に finally が「fin 」を出す。その後に呼び出し元が戻り値を表示する。"
        },
        {
          "type": "choice",
          "q": "次のコードをコンパイルするとどうなる？",
          "code": "try {\n  throw new RuntimeException();\n  System.out.println(\"A\");\n} catch (RuntimeException e) { }",
          "a": "コンパイルエラー",
          "wrong": [
            "何も表示されない",
            "A と表示される",
            "実行時に例外がスローされる"
          ],
          "explain": "throw の直後の文には絶対に到達しないので「到達不能コード」としてエラーになる。return や break の直後も同じだ。"
        },
        {
          "type": "tf",
          "q": "RuntimeException のサブクラスは、throws 宣言も try-catch もなしで投げてよい。",
          "a": true,
          "explain": "非検査例外は、プログラムの誤り（バグ）を表すことが多いので処理を強制されない。IllegalArgumentException や NullPointerException がこの仲間。"
        },
        {
          "type": "tf",
          "q": "try ブロックの中で System.exit(0) を呼んでも、finally ブロックは必ず実行される。",
          "a": false,
          "explain": "System.exit() は JVM そのものを止めるので、finally は実行されない。finally が「必ず」動くのは、return や例外でブロックを抜ける場合の話だ。"
        },
        {
          "type": "tf",
          "q": "Error は Exception のサブクラスである。",
          "a": false,
          "explain": "Error と Exception はどちらも Throwable の直接の子で、兄弟の関係。OutOfMemoryError や StackOverflowError のような回復困難な問題が Error だ。"
        },
        {
          "type": "tf",
          "q": "このコードは Java 9 以降でコンパイルできる。",
          "code": "R r = new R();\nr = new R();\ntry (r) {\n  // 処理\n}",
          "a": false,
          "explain": "try (r) の形で使える変数は final か実質的 final（再代入しない）なものだけ。2行目の再代入を消せばコンパイルできる。"
        },
        {
          "type": "tf",
          "q": "try-with-resources 文は、catch も finally も付けずに書ける。",
          "a": true,
          "explain": "リソースの close が後処理を受け持つので単独で書ける。普通の try 文は、catch か finally の少なくとも一方が必須だ。"
        },
        {
          "type": "tf",
          "q": "FileNotFoundException は IOException のサブクラスである。",
          "a": true,
          "explain": "どちらも java.io パッケージの検査例外。そのため catch (IOException e) だけで FileNotFoundException もまとめて捕まえられる。"
        },
        {
          "type": "tf",
          "q": "catch (Exception e) の後ろに catch (RuntimeException e) を書くと、コンパイルエラーになる。",
          "a": true,
          "explain": "RuntimeException は Exception の子なので、前の catch で全部捕まってしまう。catch は「狭い型から広い型へ」並べる。"
        },
        {
          "type": "tf",
          "q": "オーバーライドしたメソッドでは、親の throws に無い検査例外を新たに throws できる。",
          "a": false,
          "explain": "検査例外は「減らす・狭める・同じ」はできても、増やす・広げることはできない。非検査例外なら自由に書ける。"
        },
        {
          "type": "tf",
          "q": "このコードはコンパイルできる。（import は省略）",
          "code": "try {\n  System.out.println(\"hi\");\n} catch (IOException e) { }",
          "a": false,
          "explain": "try の中で IOException が起き得ないのに、検査例外を catch するとコンパイルエラー。ただし Exception や Throwable の catch は、非検査例外もあり得るので許される。"
        },
        {
          "type": "order",
          "q": "表示される順に並べよ",
          "code": "try {\n  System.out.print(\"A\");\n  throw new RuntimeException();\n} catch (RuntimeException e) {\n  System.out.print(\"B\");\n} finally {\n  System.out.print(\"C\");\n}\nSystem.out.print(\"D\");",
          "items": [
            "A",
            "B",
            "C",
            "D"
          ],
          "explain": "例外を catch で処理し終えると finally に進み、その後は普通に次の文へ続く。catch で処理できていれば、プログラムは止まらない。"
        },
        {
          "type": "order",
          "q": "try-with-resources の本体で例外が起きたときの実行順に並べよ",
          "items": [
            "try ブロックの本体",
            "リソースの close()（宣言と逆順）",
            "catch ブロック",
            "finally ブロック"
          ],
          "explain": "catch に入るときにはリソースはもう閉じている。だから catch の中でリソースを使うことはできない。"
        },
        {
          "type": "order",
          "q": "クラス階層を上（親）から順に並べよ",
          "items": [
            "Object",
            "Throwable",
            "Exception",
            "RuntimeException",
            "ArithmeticException"
          ],
          "explain": "throw できるのは Throwable の子孫だけ。RuntimeException は Exception の子だが、その子孫だけは例外的に「非検査」として扱われる。"
        },
        {
          "type": "fill",
          "q": "メソッドが検査例外を投げる可能性を宣言するキーワードは ＿＿",
          "a": "throws",
          "wrong": [
            "throw",
            "catch",
            "raise"
          ],
          "explain": "void read() throws IOException のようにメソッド宣言に書く。カンマで区切って複数の例外を並べられる。"
        },
        {
          "type": "fill",
          "q": "try-with-resources で使うクラスは ＿＿ インタフェースを実装している必要がある",
          "a": "AutoCloseable",
          "wrong": [
            "Runnable",
            "Serializable",
            "Comparable"
          ],
          "explain": "入出力でおなじみの Closeable は AutoCloseable の子インタフェース。AutoCloseable の close() は throws Exception と宣言されている。"
        },
        {
          "type": "fill",
          "q": "マルチキャッチでは、例外の型を ＿＿ で区切って並べる",
          "a": "|",
          "wrong": [
            "&",
            "||",
            ","
          ],
          "explain": "「|」は1本だけ。同じ処理をする catch ブロックを1つにまとめられ、Java 7 で導入された。"
        },
        {
          "type": "fill",
          "q": "close() で起きて抑制された例外は、主な例外の ＿＿ で配列として取り出せる",
          "a": "getSuppressed()",
          "wrong": [
            "getCause()",
            "getMessage()",
            "getStackTrace()"
          ],
          "explain": "getCause() は「原因となった例外」で、例外を別の例外で包んだときに使う別の仕組みだ。"
        },
        {
          "type": "fill",
          "q": "Integer.parseInt(\"abc\") は ＿＿ をスローする",
          "a": "NumberFormatException",
          "wrong": [
            "IllegalStateException",
            "ClassCastException",
            "ArithmeticException"
          ],
          "explain": "NumberFormatException は IllegalArgumentException の子で、非検査例外。だから try-catch なしでも parseInt を呼べる。"
        },
        {
          "type": "match",
          "q": "キーワードと役割を結べ",
          "pairs": [
            [
              "try",
              "例外が起きうる処理"
            ],
            [
              "catch",
              "例外を受け止める"
            ],
            [
              "finally",
              "必ず実行する後処理"
            ],
            [
              "throw",
              "例外を投げる"
            ]
          ],
          "explain": "finally は例外の有無にかかわらず動くので、ファイルを閉じるなどの後始末に使われてきた。今は try-with-resources の方が安全だ。"
        },
        {
          "type": "match",
          "q": "クラスと説明を結べ",
          "pairs": [
            [
              "Throwable",
              "throw できる型の頂点"
            ],
            [
              "Error",
              "回復困難な重大異常"
            ],
            [
              "IOException",
              "入出力の失敗"
            ]
          ],
          "explain": "Error は JVM の問題などアプリでは手当てできないもの。IOException はファイルが無いなど、起こり得ると想定して備えるべき失敗だ。"
        },
        {
          "type": "match",
          "q": "例外のメソッドと、得られるものを結べ",
          "pairs": [
            [
              "getMessage()",
              "詳細メッセージ"
            ],
            [
              "getCause()",
              "原因となった例外"
            ],
            [
              "getSuppressed()",
              "抑制された例外の配列"
            ],
            [
              "getStackTrace()",
              "スタックトレース配列"
            ]
          ],
          "explain": "printStackTrace() はスタックトレース（どのメソッドを通って例外が起きたかの記録）を標準エラー出力に表示する。"
        },
        {
          "type": "multi",
          "q": "検査例外を全て選べ",
          "options": [
            "IOException",
            "FileNotFoundException",
            "NullPointerException",
            "ArithmeticException",
            "ClassCastException"
          ],
          "correct": [
            "IOException",
            "FileNotFoundException"
          ],
          "explain": "名前に「Exception」と付いていても、RuntimeException の子孫は非検査例外。NullPointerException など3つはこちら側だ。"
        },
        {
          "type": "multi",
          "q": "非検査例外を全て選べ",
          "options": [
            "NumberFormatException",
            "IllegalArgumentException",
            "IOException",
            "ArrayIndexOutOfBoundsException",
            "Exception"
          ],
          "correct": [
            "NumberFormatException",
            "IllegalArgumentException",
            "ArrayIndexOutOfBoundsException"
          ],
          "explain": "Exception 自体は検査例外として扱われる。ArrayIndexOutOfBoundsException は IndexOutOfBoundsException を経て RuntimeException につながる。"
        },
        {
          "type": "multi",
          "q": "try ブロックが各例外を投げうるとき、コンパイルできる catch を全て選べ",
          "options": [
            "catch (IOException | SQLException e)",
            "catch (FileNotFoundException | IOException e)",
            "catch (RuntimeException | IOException e)",
            "catch (Exception | Error e)",
            "catch (ArithmeticException | RuntimeException e)"
          ],
          "correct": [
            "catch (IOException | SQLException e)",
            "catch (RuntimeException | IOException e)",
            "catch (Exception | Error e)"
          ],
          "explain": "マルチキャッチに親子関係の型を並べるとコンパイルエラー（親だけ書けば十分なため）。兄弟や無関係な型なら並べられる。"
        },
        {
          "type": "multi",
          "q": "try-with-resources について正しいものを全て選べ",
          "options": [
            "リソースは宣言と逆順に close される",
            "catch は close の後に実行される",
            "try (...) で宣言したリソース変数に再代入できる",
            "Java 9 以降、実質的 final な変数を try (r) と書ける",
            "AutoCloseable を実装しないクラスも使える"
          ],
          "correct": [
            "リソースは宣言と逆順に close される",
            "catch は close の後に実行される",
            "Java 9 以降、実質的 final な変数を try (r) と書ける"
          ],
          "explain": "try ( ) の中で宣言した変数は暗黙的に final で、再代入はコンパイルエラー。AutoCloseable でない型を書いてもコンパイルエラーになる。"
        }
      ],
      "cliffhanger": "例外を受け止める力を手に入れた。次は Java をぐっと短く書ける「ラムダ式」と、それを支える関数型インタフェースの世界へ進もう。"
    },
    {
      "title": "ラムダ式と関数型インタフェース",
      "icon": "🧩",
      "story": "ラムダ式は「処理そのもの」を値として渡す書き方で、Java 8 以降のコードのいたるところに現れる。現行の Silver SE 17（1Z0-825-JPN）の出題範囲表に「ラムダ」の文字はなく本格的には Gold SE 17 で問われるが、Silver SE 11 では「ラムダ式の理解」が範囲だった。removeIf や Comparator のように、選択肢のコードに何気なく顔を出すので、読めないと損をする。",
      "facts": [
        {
          "text": "ラムダ式は、関数型インタフェースの実装を短く書く記法",
          "detail": "(引数) -> 本体 の形で書き、代入先の型（ターゲット型）から何を実装するかが決まる。代入先がないと型が決まらず、var f = x -> x; はコンパイルエラーになる。",
          "rarity": "N"
        },
        {
          "text": "関数型インタフェース＝抽象メソッドがちょうど1つのインタフェース",
          "detail": "default メソッドや static メソッドはいくつあっても数えない。@FunctionalInterface は付けなくてもよいが、付けると条件を満たさないときコンパイルエラーで教えてくれる。",
          "rarity": "N"
        },
        {
          "text": "Predicate=test、Function=apply、Consumer=accept、Supplier=get",
          "detail": "「判定」「変換」「消費」「供給」と役割で覚えると忘れにくい。int 用の IntSupplier は getAsInt、ToIntFunction は applyAsInt と名前が変わる。",
          "rarity": "R"
        },
        {
          "text": "ラムダ式で使う外側のローカル変数は、final か実質的に final",
          "detail": "実質的に final とは「宣言後に一度も再代入されない」こと。ラムダの後で x++ しただけでもコンパイルエラーになる。フィールドはこの制限を受けない。",
          "rarity": "R"
        },
        {
          "text": "メソッド参照は4種類：static・バウンド・非バウンド・コンストラクタ",
          "detail": "Integer::parseInt（static）、str::length（特定のオブジェクト）、String::length（呼び出し時に渡されるオブジェクト）、ArrayList::new（コンストラクタ）。",
          "rarity": "SR"
        },
        {
          "text": "Comparator は equals も抽象メソッドとして宣言しているのに関数型",
          "detail": "Object の public メソッドと同じ形の抽象メソッドは「数えない」決まりがあるため。Comparator の抽象メソッドは実質 compare だけなので、ラムダ式を代入できる。",
          "rarity": "SSR"
        }
      ],
      "questions": [
        {
          "type": "tf",
          "q": "このインタフェースはコンパイルが通り、関数型インタフェースとしてラムダ式を代入できる。",
          "code": "@FunctionalInterface\ninterface Calc {\n  int calc(int x);\n  boolean equals(Object o);\n}",
          "a": true,
          "explain": "抽象メソッドが2つに見えるが、equals は Object の public メソッドと同じ形なので数えない。標準の Comparator も同じ理由で equals を宣言しつつ関数型インタフェースになっている。"
        },
        {
          "type": "number",
          "q": "java.util.function パッケージに用意されている関数型インタフェースはいくつ？",
          "a": 43,
          "unit": "個",
          "min": 10,
          "max": 80,
          "explain": "43個。Predicate や Function のほか、IntPredicate・ToLongBiFunction など基本型用の変種が大半を占める。Java 8 で登場してから数は変わっていない。"
        },
        {
          "type": "choice",
          "q": "Supplier<T> の抽象メソッドは？",
          "a": "T get()",
          "wrong": [
            "T supply()",
            "void accept(T t)",
            "T apply(T t)"
          ],
          "explain": "Supplier は引数なしで値を「供給」するので get。遅延生成や、Stream.generate の引数として使われる。"
        },
        {
          "type": "choice",
          "q": "UnaryOperator<T> が継承しているインタフェースは？",
          "a": "Function<T, T>",
          "wrong": [
            "BinaryOperator<T>",
            "Supplier<T>",
            "Predicate<T>"
          ],
          "explain": "UnaryOperator<T> は「引数と戻り値が同じ型」の Function。だから抽象メソッドは apply になる。List の replaceAll の引数がこの型だ。"
        },
        {
          "type": "choice",
          "q": "BinaryOperator<Integer> の抽象メソッドの形は？",
          "a": "Integer apply(Integer, Integer)",
          "wrong": [
            "Integer apply(Integer)",
            "boolean test(Integer, Integer)",
            "void accept(Integer, Integer)"
          ],
          "explain": "BinaryOperator<T> は BiFunction<T, T, T> を継承しているので、同じ型2つを受け取り同じ型を返す apply。Integer::sum をそのまま渡せる。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？",
          "code": "int x = 10;\nRunnable r = () ->\n  System.out.println(x);\nx++;\nr.run();",
          "a": "コンパイルエラー",
          "wrong": [
            "10 と表示される",
            "11 と表示される",
            "実行時に例外がスローされる"
          ],
          "explain": "x はラムダの後で x++ されるので実質的に final ではなく、ラムダから参照できない。値を変えたいなら別の変数にコピーしてから使う。"
        },
        {
          "type": "choice",
          "q": "Function<String, Integer> に代入するとコンパイルエラーになるのは？",
          "a": "s -> { s.length(); }",
          "wrong": [
            "s -> s.length()",
            "(String s) -> s.length()",
            "(var s) -> s.length()"
          ],
          "explain": "波かっこを使ったら、値を返すには return が必要。return がないブロックは「値を返さないラムダ」とみなされ、apply の戻り値に合わない。"
        },
        {
          "type": "choice",
          "q": "BinaryOperator<Integer> に代入するとコンパイルエラーになるのは？",
          "a": "(var a, b) -> a + b",
          "wrong": [
            "(a, b) -> a + b",
            "(Integer a, Integer b) -> a + b",
            "(var a, var b) -> a + b"
          ],
          "explain": "引数の書き方は「全部省略」「全部型名」「全部 var」のどれかにそろえる決まりがある。var は Java 11 からラムダの引数にも書けるようになった。"
        },
        {
          "type": "choice",
          "q": "Function<String, Integer> f = String::length; はどの種類のメソッド参照？",
          "a": "非バウンド（呼び出し時に渡すオブジェクトのメソッド）参照",
          "wrong": [
            "static メソッド参照",
            "バウンド（特定のオブジェクトのメソッド）参照",
            "コンストラクタ参照"
          ],
          "explain": "apply に渡した文字列そのものの length() が呼ばれる。s -> s.length() と同じ意味で、「型名::インスタンスメソッド」の形が非バウンドの目印。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "Supplier<List<String>> s =\n  ArrayList::new;\nList<String> list = s.get();\nlist.add(\"A\");\nSystem.out.println(list);",
          "a": "[A]",
          "wrong": [
            "A",
            "[]",
            "コンパイルエラー"
          ],
          "explain": "ArrayList::new はコンストラクタ参照で、get() のたびに新しい ArrayList を作る。() -> new ArrayList<>() と同じ意味だ。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "List<String> list = new ArrayList<>(\n  List.of(\"bb\", \"a\", \"ccc\"));\nlist.sort(Comparator\n  .comparing(String::length)\n  .reversed());\nSystem.out.println(list);",
          "a": "[ccc, bb, a]",
          "wrong": [
            "[a, bb, ccc]",
            "[ccc, a, bb]",
            "コンパイルエラー"
          ],
          "explain": "文字列の長さで比べ、reversed() でその逆（長い順）にする。String::length のような曖昧さのないメソッド参照なら、reversed() をつないでも型が正しく推論される。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "List<String> list = new ArrayList<>(\n  List.of(\"bc\", \"a\", \"ab\", \"b\"));\nlist.sort(Comparator\n  .comparing(String::length)\n  .thenComparing(\n    Comparator.naturalOrder()));\nSystem.out.println(list);",
          "a": "[a, b, ab, bc]",
          "wrong": [
            "[a, ab, b, bc]",
            "[bc, ab, b, a]",
            "[a, b, bc, ab]"
          ],
          "explain": "まず長さで並べ、長さが同じものだけ thenComparing の基準（辞書順）で並べる。thenComparing は「同点のときの決め手」と覚えよう。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？",
          "code": "Predicate<String> p = s -> s.isEmpty();\nPredicate<String> q = p.negate();\nSystem.out.println(\n  q.test(\"\") + \" \" + q.test(\"x\"));",
          "a": "false true",
          "wrong": [
            "true false",
            "true true",
            "false false"
          ],
          "explain": "negate() は判定を反転した Predicate を返す。空文字列は isEmpty が true なので反転して false。Java 11 からは Predicate.not(String::isEmpty) とも書ける。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？",
          "code": "Predicate<Integer> pos = n -> n > 0;\nPredicate<Integer> ev = n -> n % 2 == 0;\nSystem.out.println(\n  pos.and(ev).test(-3) + \" \"\n  + pos.or(ev).test(-3));",
          "a": "false false",
          "wrong": [
            "false true",
            "true false",
            "true true"
          ],
          "explain": "-3 は正でも偶数でもないので、and も or も false。ちなみに Java の % は左辺の符号を引き継ぎ、-3 % 2 は -1 になる。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？",
          "code": "Function<Integer, Integer> f =\n  x -> x + 1;\nFunction<Integer, Integer> g =\n  x -> x * 2;\nSystem.out.println(\n  f.andThen(g).apply(3));\nSystem.out.println(\n  f.compose(g).apply(3));",
          "a": "8 と 7 が順に表示される",
          "wrong": [
            "7 と 8 が順に表示される",
            "8 と 8 が順に表示される",
            "7 と 7 が順に表示される"
          ],
          "explain": "f.andThen(g) は「f の後に g」で (3+1)*2=8。f.compose(g) は「g を先にしてから f」で 3*2+1=7。compose は数学の f(g(x)) と同じ順番だ。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？",
          "code": "Function<String, StringBuilder> f =\n  StringBuilder::new;\nSystem.out.println(\n  f.apply(\"ab\").reverse());",
          "a": "ba",
          "wrong": [
            "ab",
            "コンパイルエラー",
            "実行時に例外がスローされる"
          ],
          "explain": "StringBuilder::new は、引数の文字列を受け取るコンストラクタの参照になる。reverse() は String にはなく、StringBuilder ならではのメソッドだ。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？",
          "code": "Function<String, Integer> f =\n  Integer::parseInt;\nSystem.out.println(f.apply(\"12\") + 1);",
          "a": "13",
          "wrong": [
            "121",
            "12",
            "コンパイルエラー"
          ],
          "explain": "apply の戻り値は Integer なので、+ 1 は文字列連結ではなく足し算になる。Integer::parseInt は「クラス名::static メソッド」の static メソッド参照。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？",
          "code": "Consumer<String> a = s ->\n  System.out.print(s + \"1\");\nConsumer<String> b = s ->\n  System.out.print(s + \"2\");\na.andThen(b).accept(\"x\");",
          "a": "x1x2",
          "wrong": [
            "x2x1",
            "x1",
            "x12"
          ],
          "explain": "andThen は a を実行した後、同じ引数で b を実行する。Consumer には compose はなく、andThen だけがある。"
        },
        {
          "type": "tf",
          "q": "default メソッドを3つ持ち、抽象メソッドが1つのインタフェースは、関数型インタフェースである。",
          "a": true,
          "explain": "数えるのは抽象メソッドだけ。Function も andThen・compose という default メソッドと identity という static メソッドを持っている。"
        },
        {
          "type": "tf",
          "q": "ラムダ式の本体から、外側のクラスのインスタンス変数（フィールド）の値を変更することはできない。",
          "a": false,
          "explain": "「実質的に final」の制限があるのはローカル変数だけ。フィールドは this 経由で読み書きできるので、ラムダ内で count++ のように変更できる。"
        },
        {
          "type": "tf",
          "q": "次のコードはコンパイルエラーになる。",
          "code": "String s = \"A\";\nPredicate<String> p =\n  s -> s.isEmpty();",
          "a": true,
          "explain": "ラムダの引数名は、外側のローカル変数と同じ名前にできない。ラムダは新しいスコープを作らない（外側と同じスコープ扱い）と覚えると理解しやすい。"
        },
        {
          "type": "tf",
          "q": "var f = x -> x * 2; はコンパイルできる。",
          "a": false,
          "explain": "ラムダ式は代入先の型がないと、どの関数型インタフェースを実装するのか決まらない。var と組み合わせるとコンパイルエラーになる。"
        },
        {
          "type": "tf",
          "q": "次のコードはコンパイルエラーになる。（import は省略）",
          "code": "List<String> list =\n  new ArrayList<>(List.of(\"a\"));\nlist.sort(Comparator\n  .comparing(s -> s.length())\n  .reversed());",
          "a": true,
          "explain": "reversed() をつなぐと comparing の型推論に代入先の情報が届かず、s が Object 扱いになって length() が見つからない。String::length にするか (String s) -> s.length() と型を書けば通る。"
        },
        {
          "type": "tf",
          "q": "x -> x * 2 と (x) -> x * 2 は同じ意味である。",
          "a": true,
          "explain": "引数が1つで型を書かないときだけ、かっこを省略できる。引数が0個や2個以上のとき、型を書くときはかっこが必要。"
        },
        {
          "type": "tf",
          "q": "引数を取らないラムダ式は -> 42 と書ける。",
          "a": false,
          "explain": "引数が0個のときは空のかっこが必須で、() -> 42 と書く。Supplier<Integer> s = () -> 42; のように使う。"
        },
        {
          "type": "tf",
          "q": "java.lang.Runnable は関数型インタフェースである。",
          "a": true,
          "explain": "Runnable の抽象メソッドは引数なし・戻り値なしの run() だけ。Java 8 で @FunctionalInterface が付けられ、スレッドに渡す処理をラムダで書けるようになった。"
        },
        {
          "type": "tf",
          "q": "@FunctionalInterface を付けていないインタフェースには、ラムダ式を代入できない。",
          "a": false,
          "explain": "抽象メソッドが1つという条件さえ満たせば、注釈がなくてもラムダ式を代入できる。注釈は「条件を守っているか」をコンパイラに確かめさせるためのもの。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "BiFunction<Integer, Integer, Integer>\n  f = (a, b) -> a * b;\nFunction<Integer, Integer> g =\n  x -> x - 1;\nSystem.out.println(\n  f.andThen(g).apply(3, 4));",
          "a": 11,
          "unit": "",
          "min": 0,
          "max": 30,
          "explain": "f で 3×4=12、andThen で g に渡して 12-1=11。BiFunction には andThen はあるが compose はない（2引数を返す関数がないため）。"
        },
        {
          "type": "number",
          "q": "メソッド参照の種類は全部でいくつ？",
          "a": 4,
          "unit": "種類",
          "min": 1,
          "max": 10,
          "explain": "static メソッド参照、特定オブジェクトのメソッド参照（バウンド）、任意オブジェクトのメソッド参照（非バウンド）、コンストラクタ参照の4つ。int[]::new のような配列の生成も書ける。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？",
          "code": "IntBinaryOperator op =\n  (a, b) -> a % b;\nSystem.out.println(\n  op.applyAsInt(17, 5));",
          "a": 2,
          "unit": "",
          "min": 0,
          "max": 10,
          "explain": "17÷5 の余りで 2。IntBinaryOperator は int 2つを受け取り int を返すので、Integer への変換（ボクシング）が起きず速い。"
        },
        {
          "type": "order",
          "q": "同じ処理のラムダ式を、省略が少ない順に並べよ",
          "items": [
            "(String s) -> { return s.length(); }",
            "(s) -> { return s.length(); }",
            "(s) -> s.length()",
            "s -> s.length()"
          ],
          "explain": "型を省略 → 波かっこと return を省略 → 引数のかっこを省略、の順。さらに String::length とメソッド参照にもできる。"
        },
        {
          "type": "order",
          "q": "f.compose(g).andThen(h).apply(x) で、関数が適用される順に並べよ",
          "items": [
            "g",
            "f",
            "h"
          ],
          "explain": "compose(g) は g を f より先に実行し、andThen(h) は全体の後に h を実行する。つまり h(f(g(x)))。"
        },
        {
          "type": "order",
          "q": "[\"b\", \"aa\", \"c\", \"ab\"] を Comparator.comparing(String::length).thenComparing(Comparator.reverseOrder()) で並べた結果を順に並べよ",
          "items": [
            "c",
            "b",
            "ab",
            "aa"
          ],
          "explain": "短い順に並べ、同じ長さどうしは辞書順の逆（reverseOrder）。\"ab\" は \"aa\" より辞書順で後なので、逆順では先になる。"
        },
        {
          "type": "fill",
          "q": "抽象メソッドが1つでないときにコンパイルエラーにしてくれる注釈は @＿＿",
          "a": "FunctionalInterface",
          "wrong": [
            "Override",
            "Functional",
            "Lambda"
          ],
          "explain": "@FunctionalInterface は java.lang パッケージにあるので import は不要。@Override と同じく「間違いを早く見つける」ための注釈だ。"
        },
        {
          "type": "fill",
          "q": "Supplier<List<String>> s = ArrayList::＿＿; でコンストラクタ参照になる",
          "a": "new",
          "wrong": [
            "create",
            "init",
            "ArrayList"
          ],
          "explain": "「クラス名::new」がコンストラクタ参照。int[]::new と書けば配列を作る IntFunction にもなる。"
        },
        {
          "type": "fill",
          "q": "ラムダ式から参照するローカル変数は、final か＿＿でなければならない",
          "a": "実質的に final",
          "wrong": [
            "static",
            "volatile",
            "private"
          ],
          "explain": "final と書かなくても、一度も再代入しなければ「実質的に final（effectively final）」とみなされる。匿名クラスでも同じルールが適用される。"
        },
        {
          "type": "fill",
          "q": "int を受け取って boolean を返す関数型インタフェースは＿＿",
          "a": "IntPredicate",
          "wrong": [
            "IntFunction",
            "ToIntFunction",
            "IntSupplier"
          ],
          "explain": "IntPredicate の抽象メソッドは boolean test(int)。Predicate<Integer> と違い、Integer への変換が起きない。"
        },
        {
          "type": "fill",
          "q": "Predicate<String> p = s -> s.isEmpty(); のとき、判定するには p.＿＿(\"\") と呼ぶ",
          "a": "test",
          "wrong": [
            "apply",
            "accept",
            "get"
          ],
          "explain": "Predicate の抽象メソッドは boolean test(T)。and・or・negate はこの test を組み合わせる default メソッドだ。"
        },
        {
          "type": "match",
          "q": "関数型インタフェースと抽象メソッド名を結べ",
          "pairs": [
            [
              "Predicate",
              "test"
            ],
            [
              "Function",
              "apply"
            ],
            [
              "Consumer",
              "accept"
            ],
            [
              "Supplier",
              "get"
            ]
          ],
          "explain": "受け取って判定・受け取って変換・受け取って消費・何も受け取らず供給。Bi が付くと引数が2つになる（BiPredicate・BiFunction・BiConsumer）。"
        },
        {
          "type": "match",
          "q": "メソッド参照と種類を結べ（str は String 型の変数）",
          "pairs": [
            [
              "Math::abs",
              "static参照"
            ],
            [
              "str::length",
              "バウンド参照"
            ],
            [
              "String::trim",
              "非バウンド参照"
            ],
            [
              "ArrayList::new",
              "コンストラクタ参照"
            ]
          ],
          "explain": "左側が変数ならバウンド、クラス名で中身がインスタンスメソッドなら非バウンド。同じ「クラス名::」でも static かどうかで種類が変わる。"
        },
        {
          "type": "match",
          "q": "基本型用の関数型インタフェースと抽象メソッド名を結べ",
          "pairs": [
            [
              "IntSupplier",
              "getAsInt"
            ],
            [
              "ToIntFunction",
              "applyAsInt"
            ],
            [
              "IntConsumer",
              "accept"
            ],
            [
              "IntPredicate",
              "test"
            ]
          ],
          "explain": "戻り値が基本型になるものは getAsInt・applyAsInt のように名前に型が付く。戻り値が void や boolean のものは名前が変わらない。"
        },
        {
          "type": "multi",
          "q": "ラムダ式を代入できる型を全て選べ",
          "options": [
            "Runnable",
            "Comparator<T>",
            "Predicate<T>",
            "List<E>",
            "Object"
          ],
          "correct": [
            "Runnable",
            "Comparator<T>",
            "Predicate<T>"
          ],
          "explain": "List は抽象メソッドが多数あり、Object はクラスなのでどちらも不可。Object o = () -> {}; はコンパイルエラーになる。"
        },
        {
          "type": "multi",
          "q": "Function<String, Integer> 型の変数に代入できるものを全て選べ",
          "options": [
            "s -> s.length()",
            "String::length",
            "(String s) -> { return s.length(); }",
            "s -> { s.length(); }",
            "(s, t) -> s.length()"
          ],
          "correct": [
            "s -> s.length()",
            "String::length",
            "(String s) -> { return s.length(); }"
          ],
          "explain": "return のないブロックは値を返せず、引数2つは apply の引数の数と合わない。どちらもコンパイルエラーになる。"
        },
        {
          "type": "multi",
          "q": "java.util.function パッケージにあるものを全て選べ",
          "options": [
            "Predicate",
            "BiFunction",
            "UnaryOperator",
            "Runnable",
            "Comparator"
          ],
          "correct": [
            "Predicate",
            "BiFunction",
            "UnaryOperator"
          ],
          "explain": "Runnable は java.lang、Comparator は java.util にある。どちらも関数型インタフェースだが、java.util.function より古くから存在していた。"
        },
        {
          "type": "multi",
          "q": "ラムダ式の本体から参照してもコンパイルが通るものを全て選べ",
          "options": [
            "宣言後に一度も再代入しないローカル変数",
            "final を付けたローカル変数",
            "外側のクラスのインスタンス変数",
            "ラムダ式の後で再代入するローカル変数",
            "ラムダ式の前で再代入したローカル変数"
          ],
          "correct": [
            "宣言後に一度も再代入しないローカル変数",
            "final を付けたローカル変数",
            "外側のクラスのインスタンス変数"
          ],
          "explain": "再代入が一度でもあれば、ラムダの前でも後でも実質的に final ではなくなる。インスタンス変数は制限を受けない。"
        }
      ],
      "cliffhanger": "処理を部品として渡す方法はそろった。次はその部品を受け止める器——リストやマップ、そして数値と日付の API に挑む。"
    },
    {
      "title": "コレクション・ジェネリクス・API",
      "icon": "📦",
      "story": "Silver SE 17（1Z0-825-JPN）の出題範囲にはっきり書かれているのは「ArrayList の使用」。remove(int) と remove(Object) の違いや、ループ中の削除で起きる例外は定番のひっかけだ。Map・Set・Deque・総称型・日付 API は Gold SE 17 の範囲だが、Silver の問題文や選択肢にも登場するので、基本の動きは押さえておきたい。",
      "facts": [
        {
          "text": "remove(int) は位置で、remove(Object) は値で削除する",
          "detail": "List<Integer> で list.remove(1) と書くと「1番目（0始まり）」が消える。値の 1 を消したいなら list.remove(Integer.valueOf(1)) と書く。",
          "rarity": "N"
        },
        {
          "text": "List.of は追加も変更も null も不可。Arrays.asList は set だけ可",
          "detail": "どちらも add すると UnsupportedOperationException。Arrays.asList は元の配列と中身を共有しているので、set で書き換えると配列側も変わる。",
          "rarity": "R"
        },
        {
          "text": "Integer は -128〜127 をキャッシュする。128 どうしの == は false",
          "detail": "Integer.valueOf や自動ボクシングは、この範囲なら同じオブジェクトを返す。範囲外は別オブジェクトなので、値の比較には equals を使う。",
          "rarity": "R"
        },
        {
          "text": "LocalDate は不変。plusDays は新しいオブジェクトを返すだけ",
          "detail": "d.plusDays(1); と書いても d は変わらない。d = d.plusDays(1); と受け取り直す必要がある。月は 1 始まりで、昔の Calendar の 0 始まりとは違う。",
          "rarity": "N"
        },
        {
          "text": "Silver SE 17 のコレクションは ArrayList。Map や総称型は Gold",
          "detail": "公式の出題範囲では、コレクション・フレームワーク、総称型、Comparator、Stream API は Gold SE 17（1Z0-826-JPN）の項目として並んでいる。",
          "rarity": "SR"
        },
        {
          "text": "Math.round(-2.5) は -3 ではなく -2 になる",
          "detail": "Math.round は「0.5 を足して切り捨て」と同じ動き。-2.5 + 0.5 = -2.0 なので -2。一方 Math.round(2.5) は 3 で、四捨五入の向きが正負で非対称に見える。",
          "rarity": "SSR"
        }
      ],
      "questions": [
        {
          "type": "tf",
          "q": "次のコードは例外をスローせず、[a, c] と表示する。（import は省略）",
          "code": "List<String> list = new ArrayList<>(\n  List.of(\"a\", \"b\", \"c\"));\nfor (String s : list) {\n  if (s.equals(\"b\")) list.remove(s);\n}\nSystem.out.println(list);",
          "a": true,
          "explain": "最後から2番目を消すと要素数が2になり、ループの「まだ次があるか」の判定（位置2 ≠ 要素数2）が false になって、例外チェックの前にループが終わる。\"a\" を消すと例外になるので、偶然に頼った動きだ。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "List<Integer> list =\n  new ArrayList<>(List.of(10, 20, 30));\nlist.remove(1);\nSystem.out.println(list);",
          "a": "[10, 30]",
          "wrong": [
            "[20, 30]",
            "[10, 20, 30]",
            "実行時に例外がスローされる"
          ],
          "explain": "int を渡すと remove(int index) が選ばれ、インデックス1の 20 が消える。ボクシングが必要な remove(Object) より、そのまま合う方が優先される。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "List<Integer> list =\n  new ArrayList<>(List.of(1, 2, 3));\nlist.remove(Integer.valueOf(1));\nlist.remove(0);\nSystem.out.println(list);",
          "a": "[3]",
          "wrong": [
            "[1]",
            "[2]",
            "[2, 3]"
          ],
          "explain": "1回目は値の 1 を削除して [2, 3]、2回目はインデックス0の 2 を削除して [3]。remove(Object) は削除できたかを boolean で返す。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "List<String> list = List.of(\"a\", \"b\");\nlist.add(\"c\");\nSystem.out.println(list);",
          "a": "実行時に例外がスローされる",
          "wrong": [
            "[a, b, c] と表示される",
            "[a, b] と表示される",
            "コンパイルエラー"
          ],
          "explain": "List.of が返すのは変更不可のリストで、add すると UnsupportedOperationException。型は普通の List なのでコンパイルは通ってしまう。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "List<String> list =\n  Arrays.asList(\"a\", \"b\", \"c\");\nlist.set(0, \"z\");\nSystem.out.println(list);",
          "a": "[z, b, c]",
          "wrong": [
            "実行時に例外がスローされる",
            "[a, b, c]",
            "コンパイルエラー"
          ],
          "explain": "Arrays.asList のリストはサイズ固定だが、set による置き換えはできる。add や remove をすると UnsupportedOperationException になる。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "List<String> list = new ArrayList<>(\n  List.of(\"a\", \"b\", \"c\"));\nfor (String s : list) {\n  if (s.equals(\"a\")) list.remove(s);\n}\nSystem.out.println(list);",
          "a": "実行時に例外がスローされる",
          "wrong": [
            "[b, c] と表示される",
            "[a, b, c] と表示される",
            "コンパイルエラー"
          ],
          "explain": "拡張 for の途中でリスト自身を変更すると、次の要素を取るときに ConcurrentModificationException になる。安全に消すなら list.removeIf(s -> s.equals(\"a\")) を使う。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "List<Integer> list = new ArrayList<>(\n  List.of(1, 2, 3, 4, 5));\nlist.removeIf(n -> n % 2 == 0);\nSystem.out.println(list);",
          "a": "[1, 3, 5]",
          "wrong": [
            "[2, 4]",
            "[1, 2, 3, 4, 5]",
            "実行時に例外がスローされる"
          ],
          "explain": "removeIf は条件（Predicate）が true の要素をまとめて消す。内部で安全に処理するので、ループ中の削除のような例外は起きない。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "Set<String> set = new TreeSet<>(\n  List.of(\"b\", \"c\", \"a\", \"b\"));\nSystem.out.println(set);",
          "a": "[a, b, c]",
          "wrong": [
            "[b, c, a]",
            "[b, c, a, b]",
            "[a, b, b, c]"
          ],
          "explain": "Set は重複を持たず、TreeSet は要素を自然順序（文字列なら辞書順）で並べて保つ。HashSet なら順序は保証されない。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "Map<String, Integer> m =\n  new HashMap<>();\nSystem.out.println(m.put(\"a\", 1));\nSystem.out.println(m.put(\"a\", 2));",
          "a": "null と 1 が順に表示される",
          "wrong": [
            "1 と 2 が順に表示される",
            "null と 2 が順に表示される",
            "1 と 1 が順に表示される"
          ],
          "explain": "put は「そのキーに前に入っていた値」を返す。初回は何もないので null、2回目は上書きされた古い値 1 が返る。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "Map<String, Integer> m =\n  new TreeMap<>();\nm.merge(\"a\", 1, Integer::sum);\nm.merge(\"a\", 1, Integer::sum);\nm.merge(\"b\", 1, Integer::sum);\nSystem.out.println(m);",
          "a": "{a=2, b=1}",
          "wrong": [
            "{a=1, b=1}",
            "{a=1, a=1, b=1}",
            "{b=1, a=2}"
          ],
          "explain": "merge はキーがなければその値を入れ、あれば古い値と新しい値を関数で合成する。単語の出現回数を数える定番の書き方だ。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "Deque<Integer> d = new ArrayDeque<>();\nd.push(1);\nd.push(2);\nd.offer(3);\nSystem.out.println(d);",
          "a": "[2, 1, 3]",
          "wrong": [
            "[1, 2, 3]",
            "[3, 2, 1]",
            "[2, 3, 1]"
          ],
          "explain": "push は先頭に、offer は末尾に追加する。ArrayDeque はスタックにもキューにも使え、ArrayDeque には null を入れられない。"
        },
        {
          "type": "choice",
          "q": "System.out.println(Math.round(-2.5)); の結果は？",
          "a": "-2",
          "wrong": [
            "-3",
            "-2.0",
            "-3.0"
          ],
          "explain": "Math.round は 0.5 を足して切り捨てた値と同じで、-2.5 + 0.5 = -2.0 から -2。戻り値は long なので小数点は付かない。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？",
          "code": "Integer a = 127, b = 127;\nInteger c = 128, d = 128;\nSystem.out.println(a == b);\nSystem.out.println(c == d);",
          "a": "true と false が順に表示される",
          "wrong": [
            "true と true が順に表示される",
            "false と false が順に表示される",
            "false と true が順に表示される"
          ],
          "explain": "標準設定では -128〜127 の Integer はキャッシュされ同じオブジェクトになるが、128 は別々に作られる。== は参照の比較なので、値を比べるなら equals を使う。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？",
          "code": "LocalDate d = LocalDate.of(2024, 1, 31);\nd.plusDays(1);\nSystem.out.println(d);",
          "a": "2024-01-31",
          "wrong": [
            "2024-02-01",
            "2024-01-32",
            "実行時に例外がスローされる"
          ],
          "explain": "LocalDate は不変で、plusDays は新しい LocalDate を返すだけ。戻り値を捨てているので d は変わらない。String の toUpperCase と同じ落とし穴だ。"
        },
        {
          "type": "choice",
          "q": "LocalDate.of(2024, 1, 31).plusMonths(1) の結果は？",
          "a": "2024-02-29",
          "wrong": [
            "2024-03-02",
            "2024-02-31",
            "実行時に例外がスローされる"
          ],
          "explain": "2月31日は存在しないので、その月の最終日に丸められる。2024年はうるう年なので29日。例外にはならない。"
        },
        {
          "type": "choice",
          "q": "System.out.println(Duration.ofMinutes(90)); の結果は？",
          "a": "PT1H30M",
          "wrong": [
            "PT90M",
            "P90M",
            "01:30"
          ],
          "explain": "Duration は ISO 8601 形式で表示され、時間部分の前に T が付く。Period（年月日）の表示は P1Y2M3D のように T がない。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？",
          "code": "List<String> list =\n  List.of(\"apple\", \"kiwi\", \"fig\");\nlist.stream()\n  .filter(s -> s.length() > 3)\n  .map(String::toUpperCase)\n  .forEach(System.out::println);",
          "a": "APPLE と KIWI が順に表示される",
          "wrong": [
            "APPLE だけ表示される",
            "APPLE と KIWI と FIG が順に表示される",
            "コンパイルエラー"
          ],
          "explain": "\"fig\" は3文字なので「3より長い」に当てはまらず落とされる。filter で絞り、map で変換し、forEach（終端操作）で初めて処理が流れる。"
        },
        {
          "type": "choice",
          "q": "次のコードの結果は？（import は省略）",
          "code": "List<String> list = new ArrayList<>(\n  List.of(\"B\", \"a\", \"C\"));\nCollections.sort(list);\nSystem.out.println(list);",
          "a": "[B, C, a]",
          "wrong": [
            "[a, B, C]",
            "[B, a, C]",
            "[C, B, a]"
          ],
          "explain": "文字列の自然順序は文字コード順で、大文字（A=65〜）は小文字（a=97〜）より前に来る。大小を無視するなら String.CASE_INSENSITIVE_ORDER を渡す。"
        },
        {
          "type": "tf",
          "q": "Arrays.asList で作ったリストには、add で要素を追加できる。",
          "a": false,
          "explain": "Arrays.asList のリストは元の配列と結びついたサイズ固定のリストで、add・remove は UnsupportedOperationException になる。追加したいなら new ArrayList<>(Arrays.asList(...)) で包む。"
        },
        {
          "type": "tf",
          "q": "List.of(\"a\", null) は要素に null を含むリストを作る。",
          "a": false,
          "explain": "List.of・Set.of・Map.of は null を受け付けず、実行時に NullPointerException をスローする。Arrays.asList や ArrayList は null を入れられる。"
        },
        {
          "type": "tf",
          "q": "次のコードはコンパイルできる。（import は省略）",
          "code": "List<? extends Number> list =\n  new ArrayList<Integer>();\nlist.add(1);",
          "a": false,
          "explain": "? extends Number のリストは「Number の何かのサブクラス」のリストで、実際の型が分からないため null 以外は add できない。読み出し専用と覚えると分かりやすい。"
        },
        {
          "type": "tf",
          "q": "LocalDate.of(2023, 2, 29) はコンパイルエラーになる。",
          "a": false,
          "explain": "コンパイルは通り、実行時に DateTimeException がスローされる。2023年はうるう年ではないので2月29日は存在しない。"
        },
        {
          "type": "tf",
          "q": "LocalDate.of(2024, 1, 1) は 2024年1月1日を表す。",
          "a": true,
          "explain": "Date and Time API の月は 1 始まり。古い java.util.Calendar は 1月が 0 で、多くのバグの原因だった。Month.JANUARY のような列挙型も使える。"
        },
        {
          "type": "tf",
          "q": "次のコードを実行しても、何も表示されない。",
          "code": "Stream.of(1, 2, 3)\n  .peek(System.out::print)\n  .filter(n -> n > 1);",
          "a": true,
          "explain": "Stream の中間操作は「遅延評価」で、forEach や count などの終端操作が呼ばれるまで1つも実行されない。peek はデバッグ用の中間操作だ。"
        },
        {
          "type": "tf",
          "q": "LocalDate.of(2024, 3, 5) を DateTimeFormatter.ofPattern(\"yyyy/mm/dd\") で format すると 2024/03/05 になる。",
          "a": false,
          "explain": "小文字の mm は「分」を表すので、時刻を持たない LocalDate では実行時に例外（UnsupportedTemporalTypeException）になる。月は大文字の MM。"
        },
        {
          "type": "tf",
          "q": "Math.abs(Integer.MIN_VALUE) の結果は負の数になる。",
          "a": true,
          "explain": "int の最小値 -2147483648 の正の値は int に収まらず、あふれて元の値に戻る。Java 15 からは、あふれると例外を出す Math.absExact もある。"
        },
        {
          "type": "tf",
          "q": "次のコードは true と表示する。",
          "code": "var a = new ArrayList<String>();\nvar b = new ArrayList<Integer>();\nSystem.out.println(\n  a.getClass() == b.getClass());",
          "a": true,
          "explain": "ジェネリクスの型引数はコンパイル後に消える（型消去）ので、実行時はどちらもただの ArrayList。だから new T() のような書き方はできない。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？（import は省略）",
          "code": "Map<String, Integer> m =\n  new HashMap<>();\nm.put(\"x\", 5);\nSystem.out.println(\n  m.getOrDefault(\"y\", 0)\n  + m.getOrDefault(\"x\", 0));",
          "a": 5,
          "unit": "",
          "min": 0,
          "max": 20,
          "explain": "\"y\" はないので既定値 0、\"x\" は 5 で、合計 5。Integer どうしの + は数値の足し算になる（どちらかが String なら連結）。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？（import は省略）",
          "code": "List<Integer> list = new ArrayList<>();\nlist.add(1);\nlist.add(0, 2);\nlist.add(1, 3);\nSystem.out.println(list.size()\n  + list.get(0) + list.get(2));",
          "a": 6,
          "unit": "",
          "min": 0,
          "max": 20,
          "explain": "[1] → 先頭に2で [2, 1] → 位置1に3で [2, 3, 1]。要素数3 + 先頭2 + 末尾1 = 6。add(位置, 値) は既存の要素を後ろにずらす。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？（import は省略）",
          "code": "LocalDate a = LocalDate.of(2024, 1, 1);\nLocalDate b =\n  LocalDate.of(2024, 12, 31);\nPeriod p = Period.between(a, b);\nSystem.out.println(p.getMonths());",
          "a": 11,
          "unit": "",
          "min": 0,
          "max": 24,
          "explain": "期間は P11M30D（11か月と30日）で、12か月にはわずかに届かない。getMonths は「年を除いた月の部分」だけを返す。"
        },
        {
          "type": "number",
          "q": "次のコードで表示される値は？（import は省略）",
          "code": "LocalDate a = LocalDate.of(2024, 2, 1);\nLocalDate b = LocalDate.of(2024, 3, 1);\nSystem.out.println(\n  ChronoUnit.DAYS.between(a, b));",
          "a": 29,
          "unit": "日",
          "min": 20,
          "max": 40,
          "explain": "2024年はうるう年なので2月は29日間。between は開始日を含み終了日を含まない数え方をする。"
        },
        {
          "type": "order",
          "q": "処理後の d の要素を、先頭から順に並べよ（import は省略）",
          "code": "Deque<String> d = new ArrayDeque<>();\nd.offerLast(\"A\");\nd.offerFirst(\"B\");\nd.offerLast(\"C\");\nd.push(\"D\");",
          "items": [
            "D",
            "B",
            "A",
            "C"
          ],
          "explain": "[A] → 先頭にBで [B, A] → 末尾にCで [B, A, C] → push は先頭に追加なので [D, B, A, C]。pop も先頭から取り出す。"
        },
        {
          "type": "order",
          "q": "TreeMap<String, Integer> にキー \"9\"・\"10\"・\"100\" を入れたとき、キーの並び順に並べよ",
          "items": [
            "10",
            "100",
            "9"
          ],
          "explain": "キーは文字列なので、数値の大きさではなく辞書順で比べる。\"1\" で始まる2つが \"9\" より前に来る。"
        },
        {
          "type": "order",
          "q": "List.of(\"b\", \"B\", \"a\", \"A\") を ArrayList にして Collections.sort した結果を順に並べよ",
          "items": [
            "A",
            "B",
            "a",
            "b"
          ],
          "explain": "文字コードは A(65) < B(66) < a(97) < b(98)。大文字が全部先に並ぶ。"
        },
        {
          "type": "fill",
          "q": "戻り値の型が int（基本型）のメソッドは Integer.＿＿(\"42\")",
          "a": "parseInt",
          "wrong": [
            "valueOf",
            "toInt",
            "parse"
          ],
          "explain": "parseInt は int を、valueOf は Integer オブジェクトを返す。どちらも数字でない文字列には NumberFormatException をスローする。"
        },
        {
          "type": "fill",
          "q": "new ArrayList<>() の <> は＿＿演算子と呼ばれる",
          "a": "ダイヤモンド",
          "wrong": [
            "ワイルドカード",
            "ジェネリック",
            "アロー"
          ],
          "explain": "形がひし形に見えることから。左辺の型から型引数を推論してくれる（Java 7 から）。"
        },
        {
          "type": "fill",
          "q": "変更不可のリストに add すると＿＿がスローされる",
          "a": "UnsupportedOperationException",
          "wrong": [
            "IllegalStateException",
            "ConcurrentModificationException",
            "ClassCastException"
          ],
          "explain": "「その操作には対応していない」という意味の非チェック例外。Collections.unmodifiableList で包んだリストも同じ例外を出す。"
        },
        {
          "type": "fill",
          "q": "今日の日付を得るには LocalDate.＿＿() と書く",
          "a": "now",
          "wrong": [
            "today",
            "current",
            "getDate"
          ],
          "explain": "LocalDate.now() はシステムの時計と既定のタイムゾーンから今日を求める。LocalDate には public なコンストラクタがなく、new LocalDate() とは書けない。"
        },
        {
          "type": "fill",
          "q": "Integer.parseInt(\"abc\") は＿＿をスローする",
          "a": "NumberFormatException",
          "wrong": [
            "ArithmeticException",
            "ClassCastException",
            "InputMismatchException"
          ],
          "explain": "NumberFormatException は IllegalArgumentException のサブクラスで、非チェック例外。前後の空白があってもこの例外になるので、必要なら trim() してから渡す。"
        },
        {
          "type": "match",
          "q": "Math のメソッド呼び出しと結果を結べ",
          "pairs": [
            [
              "round(2.5)",
              "3"
            ],
            [
              "ceil(2.1)",
              "3.0"
            ],
            [
              "floor(-2.1)",
              "-3.0"
            ],
            [
              "abs(-2)",
              "2"
            ]
          ],
          "explain": "ceil は大きい方へ、floor は小さい方へ丸め、どちらも double を返す。round は long（float なら int）を返すので小数点が付かない。"
        },
        {
          "type": "match",
          "q": "コレクションと特徴を結べ",
          "pairs": [
            [
              "ArrayList",
              "順序あり・重複可"
            ],
            [
              "HashSet",
              "重複不可・順不同"
            ],
            [
              "TreeSet",
              "重複不可・昇順"
            ],
            [
              "ArrayDeque",
              "両端で出し入れ"
            ]
          ],
          "explain": "Set は重複を許さない。HashSet は順序を保証せず、TreeSet は並べ替えた順を保つ。"
        },
        {
          "type": "match",
          "q": "Date and Time API のクラスと表すものを結べ",
          "pairs": [
            [
              "LocalDate",
              "日付だけ"
            ],
            [
              "LocalTime",
              "時刻だけ"
            ],
            [
              "Period",
              "年月日の期間"
            ],
            [
              "Duration",
              "時分秒の期間"
            ]
          ],
          "explain": "日付と時刻の両方なら LocalDateTime。どれも不変で、スレッドをまたいで安全に共有できる。"
        },
        {
          "type": "multi",
          "q": "実行時に UnsupportedOperationException になるものを全て選べ",
          "options": [
            "List.of(\"a\").add(\"b\")",
            "Arrays.asList(\"a\").remove(0)",
            "List.of(\"a\").set(0, \"b\")",
            "Arrays.asList(\"a\").set(0, \"b\")",
            "new ArrayList<>(List.of(\"a\")).add(\"b\")"
          ],
          "correct": [
            "List.of(\"a\").add(\"b\")",
            "Arrays.asList(\"a\").remove(0)",
            "List.of(\"a\").set(0, \"b\")"
          ],
          "explain": "List.of は一切変更できず、Arrays.asList はサイズを変える操作だけができない。ArrayList でコピーすれば自由に変更できる。"
        },
        {
          "type": "multi",
          "q": "コンパイルエラーになる宣言を全て選べ（import は省略）",
          "options": [
            "List<int> a = new ArrayList<>();",
            "List<Number> a = new ArrayList<Integer>();",
            "List<? extends Number> a = new ArrayList<Integer>();",
            "List<Integer> a = new ArrayList<>();",
            "var a = new ArrayList<Integer>();"
          ],
          "correct": [
            "List<int> a = new ArrayList<>();",
            "List<Number> a = new ArrayList<Integer>();"
          ],
          "explain": "型引数に基本型は書けない。また Integer が Number の子でも、List<Integer> は List<Number> の子ではない。それを受け止めるのが ? extends Number だ。"
        },
        {
          "type": "multi",
          "q": "LocalDate について正しいものを全て選べ",
          "options": [
            "plusDays は新しい LocalDate を返す",
            "LocalDate.of(2024, 13, 1) は実行時に例外になる",
            "LocalDate.of(2024, 2, 29) は有効な日付である",
            "withYear は元のオブジェクトを書き換える",
            "月は 0 から始まる（1月＝0）"
          ],
          "correct": [
            "plusDays は新しい LocalDate を返す",
            "LocalDate.of(2024, 13, 1) は実行時に例外になる",
            "LocalDate.of(2024, 2, 29) は有効な日付である"
          ],
          "explain": "LocalDate は不変なので with〜 も plus〜 も新しいオブジェクトを返す。13月は DateTimeException。"
        },
        {
          "type": "multi",
          "q": "Stream の終端操作を全て選べ",
          "options": [
            "forEach",
            "collect",
            "count",
            "filter",
            "map",
            "peek"
          ],
          "correct": [
            "forEach",
            "collect",
            "count"
          ],
          "explain": "filter・map・peek は Stream を返す中間操作。終端操作は Stream ごとに1回だけで、2回目を呼ぶと IllegalStateException になる。"
        }
      ],
      "cliffhanger": "データの器を使いこなしたら、最後は Java そのものの舞台裏へ。コンパイルから実行、そしてモジュールの仕組みをのぞこう。"
    },
    {
      "title": "モジュールとJavaの仕組み",
      "icon": "🧭",
      "story": "Silver SE 17 の最初の出題項目は「main メソッドを持つ実行可能なJavaプログラムの作成」と「コマンドラインでのコンパイルと実行」。javac と java の役割、main の書き方のルールは確実に取りたい得点源だ。モジュール・システムは Silver SE 11 で出題され、SE 17 では Gold の範囲に移ったが、Java の全体像を知る鍵になる。最後に試験そのものの形式も確かめておこう。",
      "facts": [
        {
          "text": "JDK は開発キット、JRE は実行環境、JVM はバイトコードを動かす仮想機械",
          "detail": "JDK には javac・jar・jdeps などの開発ツールと実行環境が含まれる。JVM が OS ごとに用意されているので、同じ .class ファイルがどの OS でも動く。",
          "rarity": "N"
        },
        {
          "text": "javac でコンパイルすると .class（バイトコード）ができ、java で実行する",
          "detail": "バイトコードは JVM 向けの中間コード。実行中によく使われる部分は JIT コンパイラが機械語に変換して速くする。",
          "rarity": "N"
        },
        {
          "text": "module-info.java で requires（使う）と exports（見せる）を宣言",
          "detail": "モジュールは「どのモジュールに依存し、どのパッケージを外に公開するか」を明示する仕組み。java.base だけは書かなくても全モジュールが自動で requires している。",
          "rarity": "R"
        },
        {
          "text": "Silver SE 17 は 90分・60問・合格ライン65%。SE 11 は180分・80問",
          "detail": "Oracle University Japan の試験一覧による。SE 11 Silver（1Z0-815-JPN）は 63% が合格ラインで、2026年秋に配信終了予定（試験一覧は11月30日、試験ページは10月30日と表記）。SE 17 Silver（1Z0-825-JPN）は2027年2月28日に配信終了予定と告知されている。",
          "rarity": "SR"
        },
        {
          "text": "Silver SE 17 の範囲からモジュールは外れ、Gold SE 17 に移った",
          "detail": "Silver SE 11 には「モジュール型JDK」「モジュールの宣言とモジュール間のアクセス」があった。SE 17 では jdeps や ServiceLoader とあわせて Gold の出題項目になっている。",
          "rarity": "R"
        },
        {
          "text": "java Hello.java なら javac なしで動き、.class ファイルも作られない",
          "detail": "Java 11 で入った「単一ファイルのソースコード・プログラム起動」機能。ソースをメモリ上でコンパイルしてそのまま実行するので、ディスクにクラスファイルは残らない。",
          "rarity": "SSR"
        }
      ],
      "questions": [
        {
          "type": "tf",
          "q": "java Hello.java でソースファイルを直接実行すると、カレントディレクトリに Hello.class が作られる。",
          "a": false,
          "explain": "Java 11 の単一ファイル起動では、ソースはメモリ上でコンパイルされ、クラスファイルは保存されない。ちょっとした試し書きに便利な機能だ。"
        },
        {
          "type": "choice",
          "q": "Java のソースファイルをコンパイルするコマンドは？",
          "a": "javac",
          "wrong": [
            "java",
            "jar",
            "jlink"
          ],
          "explain": "javac は「Java コンパイラ」の略。javac Hello.java で Hello.class ができ、java Hello で実行する（.class は付けない）。"
        },
        {
          "type": "choice",
          "q": "javac が生成する .class ファイルの中身は？",
          "a": "JVM が実行するバイトコード",
          "wrong": [
            "CPU が直接実行するネイティブの機械語",
            "ソースコードのコピー",
            "XML 形式の設定情報"
          ],
          "explain": "バイトコードは OS に依存しない中間コード。クラスファイルの先頭4バイトは 0xCAFEBABE という「合言葉」で始まる。"
        },
        {
          "type": "choice",
          "q": "Java 17 で、java コマンドから起動できない main メソッドは？",
          "a": "public void main(String[] args)",
          "wrong": [
            "public static void main(String... args)",
            "static public void main(String[] a)",
            "public static void main(String args[])"
          ],
          "explain": "Java 17 の起動には public static void main(String[]) が必要で、可変長引数や修飾子の順番違い、引数名の違いは問題ない。static なしの main は Java 25 で正式に認められた新機能だ。"
        },
        {
          "type": "choice",
          "q": "java Hello.java のように、ソースファイルを直接実行できるようになったのはどのバージョンから？",
          "a": "Java 11",
          "wrong": [
            "Java 8",
            "Java 9",
            "Java 17"
          ],
          "explain": "JEP 330 で Java 11 に導入された。先頭行に #! を書けば、UNIX のシェルスクリプトのように実行することもできる。"
        },
        {
          "type": "choice",
          "q": "module-info.java を置く場所は？",
          "a": "モジュールのソースのルート（パッケージのフォルダの外側）",
          "wrong": [
            "各パッケージのフォルダの中",
            "META-INF フォルダの中",
            "JDK のインストール先"
          ],
          "explain": "module-info.java はモジュールに1つだけで、ソースツリーの一番上に置く。コンパイルすると module-info.class になる。"
        },
        {
          "type": "choice",
          "q": "module-info.java に書かなくても、全てのモジュールが暗黙に requires しているモジュールは？",
          "a": "java.base",
          "wrong": [
            "java.lang",
            "java.se",
            "java.desktop"
          ],
          "explain": "java.base には java.lang・java.util・java.io など基本のパッケージが入っている。java.lang はパッケージ名で、モジュール名ではない。"
        },
        {
          "type": "choice",
          "q": "モジュール A に requires transitive B; と書いたときの効果は？",
          "a": "A を requires したモジュールも、自動的に B を読める",
          "wrong": [
            "B が A を自動的に requires する",
            "B の全パッケージが A の名前で公開される",
            "A と B が1つのモジュールに統合される"
          ],
          "explain": "「依存を引き継ぐ」宣言で、A の公開 API に B の型が出てくるときに使う。java.se モジュールは、多数のモジュールを requires transitive でまとめている。"
        },
        {
          "type": "choice",
          "q": "exports com.app.api to com.client; の意味は？",
          "a": "com.app.api パッケージを com.client モジュールにだけ公開する",
          "wrong": [
            "com.client パッケージを com.app.api に公開する",
            "com.app.api を全モジュールに公開する",
            "com.client からのリフレクションだけを許可する"
          ],
          "explain": "to を付けた exports は「限定公開（qualified export）」と呼ばれる。JDK 内部でも、特定のモジュールにだけ内部 API を見せるのに使われている。"
        },
        {
          "type": "choice",
          "q": "opens com.app.model; が許可するのは？",
          "a": "実行時のリフレクションによる、private を含むメンバーへのアクセス",
          "wrong": [
            "コンパイル時の public 型の利用",
            "com.app.model の型の継承の禁止",
            "サービスの実装の提供"
          ],
          "explain": "exports はコンパイル時と実行時の public へのアクセス、opens は実行時の深いリフレクションを許す。JSON 変換などのライブラリが使うことが多い。"
        },
        {
          "type": "choice",
          "q": "provides com.a.Service with com.b.Impl; は何を宣言している？",
          "a": "Service の実装として Impl を提供する",
          "wrong": [
            "Service を利用する",
            "Impl を com.a に公開する",
            "Service を Impl に置き換えてコンパイルする"
          ],
          "explain": "提供側は provides … with、利用側は uses を書き、ServiceLoader で実装を探す。利用側は実装クラスの名前を知らなくてよい。"
        },
        {
          "type": "choice",
          "q": "モジュール app にあるメインクラス com.app.Main を、mods フォルダから起動するコマンドは？",
          "a": "java -p mods -m app/com.app.Main",
          "wrong": [
            "java -cp mods app.com.app.Main",
            "java -m mods -p app/com.app.Main",
            "java -p mods app:com.app.Main"
          ],
          "explain": "-p（--module-path）でモジュールの置き場所、-m（--module）で「モジュール名/クラス名」を指定する。モジュールの宣言にメインクラスが記録されていれば -m app だけでもよい。"
        },
        {
          "type": "choice",
          "q": "必要なモジュールだけを含む、独自の実行環境（ランタイム・イメージ）を作るツールは？",
          "a": "jlink",
          "wrong": [
            "jdeps",
            "jar",
            "javadoc"
          ],
          "explain": "jlink を使えば、JDK 全体を入れなくてもアプリに必要な分だけの小さな実行環境を作れる。コンテナで配るときに重宝する。"
        },
        {
          "type": "choice",
          "q": "クラスパス上に置いた（モジュールではない）クラスが属するのは？",
          "a": "無名モジュール",
          "wrong": [
            "自動モジュール",
            "java.base モジュール",
            "名前付きモジュール"
          ],
          "explain": "無名モジュールは全てのモジュールを読めるが、名前がないので名前付きモジュールから requires できない。従来のアプリがそのまま動くのはこの仕組みのおかげ。"
        },
        {
          "type": "choice",
          "q": "module-info.class を持たない普通の JAR をモジュールパスに置くと、どう扱われる？",
          "a": "自動モジュールになる",
          "wrong": [
            "無名モジュールになる",
            "読み込まれずエラーになる",
            "java.base に統合される"
          ],
          "explain": "自動モジュールの名前は JAR のファイル名（またはマニフェストの Automatic-Module-Name）から決まり、全パッケージを exports する。"
        },
        {
          "type": "choice",
          "q": "JIT コンパイラの役割は？",
          "a": "実行中によく使われるバイトコードを機械語に変換して速くする",
          "wrong": [
            "ソースコードをバイトコードに変換する",
            "使われなくなったオブジェクトのメモリを解放する",
            "クラスファイルを JAR にまとめる"
          ],
          "explain": "JIT は Just-In-Time（ちょうどその時）の略。最初はインタプリタで動かし、何度も呼ばれる「ホットスポット」を見つけて機械語にする。"
        },
        {
          "type": "choice",
          "q": "Oracle Certified Java Programmer, Silver SE 17 の認定に必要な試験の番号は？",
          "a": "1Z0-825-JPN",
          "wrong": [
            "1Z0-815-JPN",
            "1Z0-826-JPN",
            "1Z0-818-JPN"
          ],
          "explain": "1Z0-815-JPN は Silver SE 11、1Z0-826-JPN は Gold SE 17、1Z0-818-JPN は Bronze。Silver SE 17 は 1Z0-825-JPN の合格だけで認定される。"
        },
        {
          "type": "tf",
          "q": "Java 17 では、main メソッドを public static void main(String... args) と可変長引数で書いても起動できる。",
          "a": true,
          "explain": "可変長引数 String... は中身が String[] と同じ扱いなので、起動用の main として認められる。final String[] args のように final を付けてもよい。"
        },
        {
          "type": "tf",
          "q": "main メソッドに static を付け忘れても、コンパイルエラーにはならない。",
          "a": true,
          "explain": "static のない main もただのメソッドとしてはコンパイルできる。Java 17 では java で起動したときに「static ではありません」というエラーになる。"
        },
        {
          "type": "tf",
          "q": "java.base を使うには、module-info.java に requires java.base; を書く必要がある。",
          "a": false,
          "explain": "java.base は全モジュールが自動で読んでいるので書かなくてよい（書いてもエラーにはならない）。String や List が何もせず使えるのはこのため。"
        },
        {
          "type": "tf",
          "q": "exports はパッケージ単位で指定し、クラス単位では指定できない。",
          "a": true,
          "explain": "モジュールの公開単位はパッケージ。公開したパッケージの中でも、外から使えるのは public な型だけだ。"
        },
        {
          "type": "tf",
          "q": "requires には、依存するパッケージの名前を書く。",
          "a": false,
          "explain": "requires に書くのはモジュール名、exports と opens に書くのはパッケージ名。どちらも java.sql のようなドット区切りなので取り違えやすい。"
        },
        {
          "type": "tf",
          "q": "モジュール A が B を requires し、B も A を requires する循環した依存は許される。",
          "a": false,
          "explain": "モジュールの依存が循環するとコンパイルエラーになる。共通部分を別のモジュールに切り出して循環を断つのが定石だ。"
        },
        {
          "type": "tf",
          "q": "javac は Java のソースを CPU が直接実行する機械語に変換する。",
          "a": false,
          "explain": "javac が作るのは JVM 向けのバイトコード。機械語への変換は、実行時に JVM の JIT コンパイラが必要な部分だけ行う。"
        },
        {
          "type": "tf",
          "q": "Java SE 17 Programmer I（1Z0-825-JPN）の合格ラインは 65% である。",
          "a": true,
          "explain": "60問中39問の正解が目安。Gold SE 17（1Z0-826-JPN）も同じく 90分・60問・65%。"
        },
        {
          "type": "tf",
          "q": "Oracle Certified Java Programmer の資格として認定されるには、日本語試験を受験する必要がある。",
          "a": true,
          "explain": "Oracle University Japan によると、英語試験で合格した場合は Oracle Certification Program の認定対象にはなるが、OCJP 資格としての同時認定の対象にはならない。"
        },
        {
          "type": "number",
          "q": "Silver SE 17（1Z0-825-JPN）の試験時間は何分？",
          "a": 90,
          "unit": "分",
          "min": 30,
          "max": 180,
          "explain": "90分。Silver SE 11 は180分だったので半分になった。受験時にはこのほか、同意やアンケートのための時間が必要。"
        },
        {
          "type": "number",
          "q": "Silver SE 17（1Z0-825-JPN）の出題数は何問？",
          "a": 60,
          "unit": "問",
          "min": 20,
          "max": 110,
          "explain": "60問の選択問題。90分なので1問あたり1分半。Silver SE 11 は80問だった。"
        },
        {
          "type": "number",
          "q": "Silver SE 17（1Z0-825-JPN）の合格ラインは何％？",
          "a": 65,
          "unit": "％",
          "min": 40,
          "max": 95,
          "explain": "65%。Bronze（1Z0-818-JPN）は 65分・60問・60%で、言語未経験者向けの入門資格と位置づけられている。"
        },
        {
          "type": "number",
          "q": "java Hello.java a b c で起動したとき、main の args.length は？",
          "a": 3,
          "unit": "",
          "min": 0,
          "max": 8,
          "explain": "ソースファイル名の後ろの a・b・c がプログラムへの引数になる。java や Hello.java 自体は args に含まれない。"
        },
        {
          "type": "order",
          "q": "Java のプログラムが動くまでの流れを順に並べよ",
          "items": [
            ".java ファイルにソースを書く",
            "javac でコンパイルする",
            ".class（バイトコード）ができる",
            "JVM が読み込んで実行する"
          ],
          "explain": "JVM はクラスを必要になった時点で読み込む（遅延ロード）。単一ファイル起動では、2と3がメモリ上で済まされる。"
        },
        {
          "type": "order",
          "q": "OCJP の資格を、対象者のレベルが低い順に並べよ",
          "items": [
            "Bronze",
            "Silver",
            "Gold"
          ],
          "explain": "公式の説明では、Bronze は言語未経験者向けの入門資格、Silver は開発初心者向け、Gold は中上級者向け。Bronze はバージョンに依存しない資格になっている。"
        },
        {
          "type": "order",
          "q": "含まれる範囲が小さい順に並べよ",
          "items": [
            "JVM",
            "JRE",
            "JDK"
          ],
          "explain": "JRE は JVM と標準ライブラリ、JDK はさらに javac などの開発ツールを含む。Java 11 以降、Oracle は JRE 単体の配布をやめ JDK に一本化した。"
        },
        {
          "type": "fill",
          "q": "パッケージ com.app.api を他のモジュールに公開するには module-info.java に ＿＿ com.app.api; と書く",
          "a": "exports",
          "wrong": [
            "requires",
            "provides",
            "uses"
          ],
          "explain": "exports したパッケージの public 型だけが外から見える。公開していないパッケージは public でも外からは使えない。"
        },
        {
          "type": "fill",
          "q": "自分を requires したモジュールにも java.sql を読ませるには requires ＿＿ java.sql; と書く",
          "a": "transitive",
          "wrong": [
            "static",
            "public",
            "all"
          ],
          "explain": "requires static はコンパイル時だけ必要で実行時は任意という意味になる。transitive と static は役割がまったく違う。"
        },
        {
          "type": "fill",
          "q": "java コマンドでクラスパスを指定するオプションは＿＿",
          "a": "-cp",
          "wrong": [
            "-p",
            "-d",
            "-m"
          ],
          "explain": "-cp は -classpath・--class-path と同じ。-p はモジュールパスなので取り違えに注意。"
        },
        {
          "type": "fill",
          "q": "javac ＿＿ out Hello.java で、クラスファイルを out フォルダに出力できる",
          "a": "-d",
          "wrong": [
            "-o",
            "-cp",
            "-p"
          ],
          "explain": "-d は directory の d。パッケージ宣言があれば、out の下にパッケージ名どおりのフォルダが自動で作られる。"
        },
        {
          "type": "fill",
          "q": "クラスや JAR がどのモジュールに依存しているかを調べるツールは＿＿",
          "a": "jdeps",
          "wrong": [
            "jlink",
            "jshell",
            "jmod"
          ],
          "explain": "jdeps は依存関係を解析し、JDK の内部 API を使っていないかの確認にも使える。jshell は Java 9 で入った対話型の実行ツール。"
        },
        {
          "type": "match",
          "q": "JDK のツールと役割を結べ",
          "pairs": [
            [
              "javac",
              "コンパイル"
            ],
            [
              "java",
              "プログラムの実行"
            ],
            [
              "jar",
              "アーカイブ作成"
            ],
            [
              "jlink",
              "ランタイム作成"
            ]
          ],
          "explain": "jar は複数のクラスファイルを ZIP 形式の1ファイルにまとめる。実行可能 JAR なら java -jar app.jar で起動できる。"
        },
        {
          "type": "match",
          "q": "module-info.java のディレクティブと意味を結べ",
          "pairs": [
            [
              "requires",
              "依存先を指定"
            ],
            [
              "exports",
              "パッケージを公開"
            ],
            [
              "opens",
              "リフレクション許可"
            ],
            [
              "uses",
              "サービスを利用"
            ]
          ],
          "explain": "もう1つ、実装を提供する provides … with がある。open module と書けば全パッケージを opens したのと同じになる。"
        },
        {
          "type": "match",
          "q": "試験と試験時間を結べ",
          "pairs": [
            [
              "Bronze SE",
              "65分"
            ],
            [
              "Silver SE 17",
              "90分"
            ],
            [
              "Silver SE 11",
              "180分"
            ]
          ],
          "explain": "Bronze は 60問・60%、Silver SE 17 は 60問・65%、Silver SE 11 は 80問・63%。新しい SE 17 は時間も問題数も減っている。"
        },
        {
          "type": "multi",
          "q": "Java 17 で java コマンドから起動できる main メソッドを全て選べ",
          "options": [
            "public static void main(String[] a)",
            "public static void main(String... a)",
            "static public void main(String a[])",
            "public void main(String[] a)",
            "public static int main(String[] a)"
          ],
          "correct": [
            "public static void main(String[] a)",
            "public static void main(String... a)",
            "static public void main(String a[])"
          ],
          "explain": "public と static の順番は自由で、配列の [] は変数名の後ろでもよい。static なし・戻り値が int の main は、コンパイルはできても起動はできない。"
        },
        {
          "type": "multi",
          "q": "module-info.java に書けるディレクティブを全て選べ",
          "options": [
            "requires",
            "exports",
            "opens",
            "imports",
            "extends",
            "includes"
          ],
          "correct": [
            "requires",
            "exports",
            "opens"
          ],
          "explain": "ほかに uses と provides がある。module-info.java でも、ファイルの先頭で普通の import 文は使える（ディレクティブではない）。"
        },
        {
          "type": "multi",
          "q": "無名モジュールと自動モジュールについて正しいものを全て選べ",
          "options": [
            "クラスパス上のクラスは無名モジュールに属する",
            "モジュールパス上の module-info のない JAR は自動モジュールになる",
            "自動モジュールは全てのパッケージを exports する",
            "名前付きモジュールは無名モジュールを requires できる"
          ],
          "correct": [
            "クラスパス上のクラスは無名モジュールに属する",
            "モジュールパス上の module-info のない JAR は自動モジュールになる",
            "自動モジュールは全てのパッケージを exports する"
          ],
          "explain": "無名モジュールには名前がないので requires で指定できない。古いライブラリをモジュール化されたアプリから使うときは、自動モジュールが橋渡し役になる。"
        },
        {
          "type": "multi",
          "q": "Silver SE 17（1Z0-825-JPN）の公式の出題範囲に含まれる項目を全て選べ",
          "options": [
            "switch 式の使用",
            "レコード・クラスの作成と使用",
            "シール・クラスの作成と使用",
            "モジュール・システム",
            "Stream API",
            "JDBC によるデータベース操作"
          ],
          "correct": [
            "switch 式の使用",
            "レコード・クラスの作成と使用",
            "シール・クラスの作成と使用"
          ],
          "explain": "Silver SE 17 は言語の基本を中心に、switch 式やレコードなど Java 11 以降の新しい文法も問う。モジュール・Stream・JDBC は Gold SE 17 の出題項目に並んでいる。"
        }
      ],
      "cliffhanger": "文法も API も仕組みも、試験の形もつかんだ。残る問いはただ一つ——どうすれば合格できる？"
    }
  ],
  "finale": {
    "title": "合格への答え",
    "text": "Silver のひっかけは、ほとんどが「コンパイラがどう判断するか」と「実行時に何が起きるか」の取り違えから生まれる。まず宣言・型・スコープ・アクセス修飾子を見てコンパイルが通るかを判定し、通るときだけ1行ずつ値を追う。この2段階の読み方を身につければ、初めて見るコードでも落ち着いて答えを出せる。間違えた問題は、どのルールを見落としたかを言葉にして覚え直そう。コンパイラの目を持ったとき、コードは謎ではなく、読める文章になる。"
  },
  "sources": [
    {
      "title": "Java SE 17 Programmer I（1Z0-825-JPN）試験概要｜Oracle University",
      "url": "https://www.oracle.com/jp/education/certification/javase-17-programmer-1/"
    },
    {
      "title": "Java SE 17 認定資格｜Oracle University",
      "url": "https://www.oracle.com/jp/education/certification/jse17-73106-ja.html"
    },
    {
      "title": "Java 認定試験一覧｜Oracle University",
      "url": "https://www.oracle.com/jp/education/certification/examlist-172597-ja.html"
    },
    {
      "title": "Java SE 17 Programmer II（Gold）試験概要",
      "url": "https://www.oracle.com/jp/education/certification/javase-17-programmer-2/"
    },
    {
      "title": "Java SE 11 Programmer I（旧Silver）試験概要",
      "url": "https://www.oracle.com/jp/education/certification/javase-11-programmer-1/"
    },
    {
      "title": "The Java Language Specification, Java SE 17 Edition（8章 クラス）",
      "url": "https://docs.oracle.com/javase/specs/jls/se17/html/jls-8.html"
    },
    {
      "title": "The Java Language Specification, Java SE 17 Edition（14章 文）",
      "url": "https://docs.oracle.com/javase/specs/jls/se17/html/jls-14.html"
    },
    {
      "title": "Programmer's Guide to Text Blocks（Java SE 17）",
      "url": "https://docs.oracle.com/en/java/javase/17/text-blocks/index.html"
    },
    {
      "title": "java.util.Arrays（Java SE 17 API）",
      "url": "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Arrays.html"
    },
    {
      "title": "The try-with-resources Statement（Java Tutorials）",
      "url": "https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html"
    },
    {
      "title": "JEP 409: Sealed Classes",
      "url": "https://openjdk.org/jeps/409"
    },
    {
      "title": "JEP 330: Launch Single-File Source-Code Programs",
      "url": "https://openjdk.org/jeps/330"
    }
  ],
  "rogue": {
    "tower": "JVMの塔",
    "hero": "☕",
    "intro": "湯気の立つコーヒーを片手に、バイトコードでできた塔へ。一階ごとにコンパイルエラーと例外の魔物が待ち受ける。正しいコードだけが、頂への階段になる。",
    "status": {
      "poison": {
        "n": "メモリリーク",
        "e": "💧"
      }
    },
    "cards": {
      "strike": {
        "n": "System.out.println",
        "e": "🖨️"
      },
      "defend": {
        "n": "try ブロック",
        "e": "🛡️"
      },
      "insight": {
        "n": "デバッガの閃き",
        "e": "💡"
      },
      "bash": {
        "n": "throw new",
        "e": "💥"
      },
      "twin": {
        "n": "for ループ",
        "e": "🔁"
      },
      "both": {
        "n": "try-catch",
        "e": "🥅"
      },
      "quick": {
        "n": "三項演算子",
        "e": "❓"
      },
      "refute": {
        "n": "コンパイラの指摘",
        "e": "☝️"
      },
      "scholar": {
        "n": "Javadoc 熟読",
        "e": "📚"
      },
      "slam": {
        "n": "final の重み",
        "e": "🧱"
      },
      "chain": {
        "n": "メソッドチェーン",
        "e": "⛓️"
      },
      "finisher": {
        "n": "System.exit",
        "e": "🔚"
      },
      "cascade": {
        "n": "NullPointer 爆弾",
        "e": "💣"
      },
      "whirl": {
        "n": "ストリームの奔流",
        "e": "🌊"
      },
      "momentum": {
        "n": "JIT コンパイル",
        "e": "🚀"
      },
      "heavy": {
        "n": "ジェネリクスの型推論",
        "e": "🧬"
      },
      "execute": {
        "n": "ガベージコレクション",
        "e": "🗑️"
      },
      "drain": {
        "n": "ヒープ吸収",
        "e": "🧲"
      },
      "reckless": {
        "n": "@SuppressWarnings",
        "e": "🙈"
      },
      "barrage": {
        "n": "ラムダ三連",
        "e": "➡️"
      },
      "wall": {
        "n": "カプセル化",
        "e": "🏰"
      },
      "dig": {
        "n": "import 文",
        "e": "📥"
      },
      "mshield": {
        "n": "型チェック",
        "e": "✅"
      },
      "spark": {
        "n": "コーヒーブレイク",
        "e": "☕"
      },
      "focus": {
        "n": "リファクタリング",
        "e": "🧘"
      },
      "curse2": {
        "n": "コードレビュー",
        "e": "🔍"
      },
      "rest2": {
        "n": "ビルド成功",
        "e": "🟢"
      },
      "awaken": {
        "n": "徹夜のコーディング",
        "e": "🌙"
      },
      "toxin": {
        "n": "無限ループ",
        "e": "♾️"
      },
      "catalyst": {
        "n": "スタックオーバーフロー",
        "e": "📈"
      },
      "entrench": {
        "n": "イミュータブル化",
        "e": "🧊"
      },
      "feint": {
        "n": "オーバーロード",
        "e": "🎭"
      },
      "shout": {
        "n": "@Override",
        "e": "📢"
      },
      "sacrifice": {
        "n": "デスマーチ",
        "e": "💸"
      },
      "recall": {
        "n": "git revert",
        "e": "♻️"
      },
      "study": {
        "n": "写経（写しコード）",
        "e": "✍️"
      },
      "allin": {
        "n": "本番環境で直接修正",
        "e": "🎲"
      },
      "curio": {
        "n": "テストのグリーン",
        "e": "🟩"
      },
      "genius": {
        "n": "毎日のコミット",
        "e": "📅"
      },
      "fortress": {
        "n": "sealed 宣言",
        "e": "🔒"
      },
      "thorns": {
        "n": "チェック例外",
        "e": "🌵"
      },
      "barricade": {
        "n": "static 領域",
        "e": "🗄️"
      },
      "library": {
        "n": "標準ライブラリ",
        "e": "🏛️"
      },
      "echo": {
        "n": "再帰呼び出し",
        "e": "🔂"
      },
      "mastery": {
        "n": "Silver 合格証",
        "e": "🎓"
      },
      "confuse": {
        "n": "スパゲッティコード",
        "e": "🍝"
      },
      "doubt": {
        "n": "たぶん動くはず",
        "e": "🤔"
      }
    },
    "foes": [
      {
        "n": "バグの霧",
        "e": "🌫️",
        "base": "fog"
      },
      {
        "n": "NullPointer の蠍",
        "e": "🦂",
        "base": "scorp"
      },
      {
        "n": "型キャストの蛇",
        "e": "🐍",
        "base": "snake"
      },
      {
        "n": "依存関係の蜘蛛",
        "e": "🕷️",
        "base": "spider"
      },
      {
        "n": "配列外のコウモリ",
        "e": "🦇",
        "base": "bat"
      },
      {
        "n": "レガシーコードの岩",
        "e": "🪨",
        "base": "golem"
      }
    ],
    "elites": [
      {
        "n": "未捕捉例外の鬼",
        "e": "👹",
        "base": "oni"
      },
      {
        "n": "ダイヤモンド継承の龍",
        "e": "🐉",
        "base": "dragon"
      },
      {
        "n": "非推奨APIの亡者",
        "e": "🧟",
        "base": "mummy"
      }
    ],
    "boss": {
      "n": "コンパイラの番人",
      "e": "🤖"
    },
    "relics": {
      "pot": {
        "n": "マグカップ",
        "e": "☕"
      },
      "scroll": {
        "n": "API リファレンス",
        "e": "📜"
      },
      "scarab": {
        "n": "ラバーダック",
        "e": "🦆"
      },
      "flame": {
        "n": "確信のアサーション",
        "e": "🔥"
      },
      "scale": {
        "n": "IDE の補完",
        "e": "⌨️"
      },
      "eye": {
        "n": "静的解析ツール",
        "e": "🔎"
      },
      "compass": {
        "n": "セール中の問題集",
        "e": "🏷️"
      },
      "stone": {
        "n": "ヒープ領域の拡張",
        "e": "🧱"
      },
      "lamp": {
        "n": "朝のコーヒー",
        "e": "🌅"
      },
      "feather": {
        "n": "スタックトレース",
        "e": "🧾"
      },
      "idol": {
        "n": "オープンソースの寄付箱",
        "e": "🪙"
      },
      "book": {
        "n": "黒本（問題集）",
        "e": "📕"
      },
      "hourglass": {
        "n": "タイムボックス",
        "e": "⏳"
      }
    },
    "events": {
      "stele": {
        "title": "レガシーコードの石版",
        "text": "古いサーバー室の奥に、誰も読めないコードが刻まれた石版がある。動作を正しく言い当てれば宝が現れるが、外せば例外が降ってくる。"
      },
      "spring": {
        "title": "コーヒーの泉",
        "text": "香ばしい湯気の立つ泉が湧いている。三つの問いに正しく答えれば、一杯のコーヒーが疲れを癒やし、コードを磨いてくれるらしい。"
      },
      "lost": {
        "title": "置き忘れのノートPC",
        "text": "休憩室に、誰かのノートPCが開いたまま置かれている。画面には書きかけのコードとメモが残っているようだ。"
      },
      "merchant": {
        "title": "怪しいライブラリ売り",
        "text": "フードの男が「動作保証なしの秘伝ライブラリ、お代は体力で結構」とささやく。体力と引き換えに、珍しい札を譲ってくれるという。"
      },
      "whisper": {
        "title": "コンパイラの囁き",
        "text": "画面の隅から「そのコード、本当にコンパイルが通る？」と声がする。正しく答えれば迷いの札を1枚消せるが、誤れば呪いが手札に紛れ込む。"
      },
      "library": {
        "title": "技術書の本棚",
        "text": "開発室の壁一面に技術書が並んでいる。先輩が「1冊だけなら持っていっていいよ」と言った。"
      }
    },
    "dungeons": [
      {
        "id": "kiso",
        "n": "基礎文法の塔",
        "e": "🧱",
        "chapters": [
          0,
          1,
          2
        ],
        "boss": {
          "n": "コンパイルエラーの巨人",
          "e": "🗿"
        },
        "desc": "データ型・文字列・演算子・分岐・ループ・配列。1行ずつ正確に読む力を鍛える"
      },
      {
        "id": "oop",
        "n": "オブジェクト指向の塔",
        "e": "🏗️",
        "chapters": [
          3,
          4
        ],
        "boss": {
          "n": "ポリモーフィズムの化身",
          "e": "🎭"
        },
        "desc": "クラス・コンストラクタ・継承・インタフェース。どのメソッドが呼ばれるかを見抜け"
      },
      {
        "id": "reigai",
        "n": "例外の塔",
        "e": "🧯",
        "chapters": [
          5
        ],
        "boss": {
          "n": "未捕捉例外の魔王",
          "e": "👿"
        },
        "desc": "try-catch-finally と try-with-resources。実行の順番を追い切れ"
      },
      {
        "id": "lambda",
        "n": "ラムダの塔",
        "e": "🧩",
        "chapters": [
          6,
          7
        ],
        "boss": {
          "n": "ストリームの大蛇",
          "e": "🐉"
        },
        "desc": "ラムダ式・関数型インタフェース・コレクション・API。短いコードの深い意味を読む"
      },
      {
        "id": "module",
        "n": "モジュールの塔",
        "e": "🧭",
        "chapters": [
          8
        ],
        "boss": {
          "n": "JVMの番人",
          "e": "🤖"
        },
        "desc": "module-info・javac/java コマンド・JDK の仕組み"
      },
      {
        "id": "all",
        "n": "Silver 本試験の塔",
        "e": "🏆",
        "unlock": 3,
        "boss": {
          "n": "Java Silver の試験官",
          "e": "🧑‍💼"
        },
        "desc": "全章から出題。3つの塔を踏破すると挑戦できる本試験"
      }
    ]
  }
});
