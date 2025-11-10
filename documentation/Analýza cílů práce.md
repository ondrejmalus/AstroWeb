

# Analýza cílů práce

**Název práce:**  
AstroWeb – webová a desktopová aplikace pro prezentaci a správu astronomických snímků

**Autor:**  
Ondřej Malůš  

## Co je cílem práce?
Cílem práce je vytvořit aplikaci, která propojí desktopové a webové prostředí a umožní efektivní správu a veřejnou prezentaci vlastních astrofotografií. Desktopová aplikace vytvořená v Electronu bude sloužit jako administrátorské rozhraní pro nahrávání a správu snímků. Webová aplikace založená na Node.js bude veřejně přístupná a nabídne návštěvníkům katalog snímků, detailní informace a možnost jejich hodnocení. Projekt má ukázat praktické zvládnutí technologií (Electron, webový vývoj, databáze, autentizace) a přinést originální obsah díky vlastním astrofotografiím.

### Požadavky na produkt
Produkt musí umožnit:
- přihlášení administrátora do desktopové aplikace,
- nahrávání nových snímků s vyplněním základních informací (název, vzdálenost, zajímavost atd.),
- ukládání dat do databáze (MySQL nebo SQLite),
- veřejné zobrazení snímků ve webové aplikaci,
- registraci a přihlášení uživatelů,
- hodnocení snímků přihlášenými uživateli,
- rozdělení rolí na administrátora, registrovaného uživatele a nepřihlášeného návštěvníka.

Minimálním produktem je funkční propojení desktopové a webové části s databází a základním rolováním uživatelů. Pro plnohodnotný výsledek je navíc požadována možnost hodnocení snímků a filtrování podle kategorií.

## Komu produkt pomůže? Kdo je zákazník?
Hlavním zákazníkem je autor projektu, který získá nástroj pro snadnou správu a prezentaci svých astrofotografií. Zároveň je produkt určen veřejnosti se zájmem o astronomii, která získá možnost prohlížet si fotografie a hodnotit je. 

### Jaká je cílová platforma?
Cílovými platformami jsou:
- desktopová aplikace pro operační systémy Windows (případně multiplatformně díky Electronu),
- webová aplikace dostupná v běžných internetových prohlížečích.

### Jaká věková skupina?
Produkt není věkově omezen. Primárně cílí na mladší a střední generaci se zájmem o astronomii a moderní technologie, typicky středoškoláky a vysokoškoláky, ale může oslovit i širší veřejnost.

### Jaká předchozí zkušenost, vědomosti apod.?
Používání webové části aplikace nevyžaduje žádné zvláštní znalosti – stačí se zaregistrovat, přihlásit a využívat funkce hodnocení snímků. Administrátorské rozhraní vyžaduje základní uživatelskou orientaci v práci s počítačem a případně vývojovém rozhraní.

## V čem spočívá přínos práce?
Přínosem práce je praktické osvojení moderních technologií pro tvorbu desktopových a webových aplikací, práce s databází, autentizací a rolováním uživatelů. Přínosem pro veřejnost je možnost nahlédnout do autorových astrofotografií a hodnotit je, čímž projekt získává i sociální rozměr. Z pohledu školy je práce ukázkou propojení různých oblastí IT a jejich aplikace na originální téma.

## Jaké konkrétní ověřitelné body je třeba vyřešit?
- Desktopová aplikace umožní administrátorovi nahrávat nové snímky.  
- Data se uloží do databáze.  
- Webová aplikace zobrazí snímky veřejnosti.  
- Uživatelé se mohou registrovat a přihlásit.  
- Přihlášení uživatelé mohou hodnotit snímky.  
- Systém rozliší role administrátora, registrovaného uživatele a nepřihlášeného návštěvníka.  

## Alternativní produkty a čím se tento liší
Existuje více platforem pro sdílení a hodnocení fotografií, například:  
- **Flickr** – mezinárodní platforma pro fotografy.  
- **AstroBin** – specializovaný web pro astrofotografii.  
- **Instagram** – univerzální sociální síť pro sdílení obrázků.  

Na rozdíl od nich je AstroWeb úzce zaměřený na osobní prezentaci autorových astrofotografií a propojuje desktopovou a webovou část. Nejedná se o masovou službu, ale o demonstrační projekt s cílem ukázat propojení moderních technologií, správu dat a vizuálně atraktivní výsledek.

