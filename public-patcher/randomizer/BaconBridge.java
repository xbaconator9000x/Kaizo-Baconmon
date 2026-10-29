import com.dabomstew.pkrandom.*;
import com.dabomstew.pkrandom.romhandlers.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;

/** GPL-3.0-or-later: adapter around the unmodified UPR-ZX 4.6.0 engine. */
public final class BaconBridge {

    public static String nuzlockeSettings() {
        Settings s = new Settings();
        s.setSelectedEXPCurve(com.dabomstew.pkrandom.pokemon.ExpCurve.MEDIUM_FAST);
        s.setWildPokemonMod(false, true, false, false);
        s.setRomName("Fire Red (U) 1.1");
        return Version.VERSION + s.toString();
    }

    public static String version() {
        return Version.VERSION_STRING + ":" + Version.VERSION;
    }

    public static String generate(String input, String output, String setting, String seedText)
        throws Exception {
        return generateConfigured(input, output, setting, seedText, null, false);
    }

    private static String generateConfigured(String input, String output, String setting, String seedText, int[] starters, boolean preserveEvolutionMethods)
        throws Exception {
        long seed = Long.parseLong(seedText);
        if (seed < 0 || seed > 9007199254740991L) throw new IllegalArgumentException(
            "Seed must be between 0 and 9007199254740991."
        );
        String value = setting.trim();
        if (
            value.length() < 4 || !value.substring(0, 3).equals(Integer.toString(Version.VERSION))
        ) throw new IllegalArgumentException(
            "Settings must use the UPR-ZX " + Version.VERSION + " format."
        );
        Settings settings = Settings.fromString(value.substring(3));
        Gen3RomHandler.Factory factory = new Gen3RomHandler.Factory();
        if (!factory.isLoadable(input)) throw new IllegalArgumentException(
            "This engine could not recognise the ROM."
        );
        RomHandler handler = factory.create(RandomSource.instance());
        handler.loadRom(input);
        if (!handler.getROMCode().equals("BPRE")) throw new IllegalArgumentException(
            "Use US FireRed for this build."
        );
        settings.setCustomNames(FileFunctions.getCustomNames());
        settings.tweakForRom(handler);
        if (preserveEvolutionMethods) {
            settings.setChangeImpossibleEvolutions(false);
            settings.setMakeEvolutionsEasier(false);
            settings.setRemoveTimeBasedEvolutions(false);
        }
        if (starters != null) configureBabymonStarters(settings, handler.getPokemonInclFormes(), starters);
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        PrintStream log = new PrintStream(bytes, false, "UTF-8");
        int check = new Randomizer(
            settings,
            handler,
            ResourceBundle.getBundle("com/dabomstew/pkrandom/newgui/Bundle"),
            false
        ).randomize(output, log, seed);
        log.close();
        Files.write(Paths.get(output + ".log"), bytes.toByteArray());
        return Integer.toUnsignedString(check);
    }

    public static String generateSafe(String input, String output, String settings, String seed) {
        try {
            return "OK:" + generate(input, output, settings, seed);
        } catch (Exception e) {
            return "ERROR:" + e.getClass().getSimpleName() + ": " + e.getMessage();
        }
    }


    // Configure picks before UPR processes rival teams and starter descriptions.
    static void configureBabymonStarters(Settings settings,
            java.util.List<com.dabomstew.pkrandom.pokemon.Pokemon> pokemon, int[] dex) throws Exception {
        Set<Integer> allowed = new HashSet<Integer>();
        InputStream stream = BaconBridge.class.getResourceAsStream("/babymon_tier1.txt");
        if (stream == null) throw new IllegalStateException("Missing Babymon Tier 1 data.");
        try (Scanner scanner = new Scanner(stream, "UTF-8")) {
            while (scanner.hasNextInt()) allowed.add(scanner.nextInt());
        }
        if (allowed.size() != 126 || dex.length != 3) throw new IllegalArgumentException("Invalid Babymon starter data.");
        java.util.List<com.dabomstew.pkrandom.pokemon.Pokemon> selectable = new ArrayList<>();
        for (com.dabomstew.pkrandom.pokemon.Pokemon p : pokemon)
            if (p == null || !p.actuallyCosmetic) selectable.add(p);
        int[] indexes = new int[3];
        for (int i=0; i<3; i++) {
            if (!allowed.contains(dex[i])) throw new IllegalArgumentException("Starter outside Babymon Tier 1.");
            for (int j=0; j<selectable.size(); j++)
                if (selectable.get(j)!=null && selectable.get(j).number==dex[i]) { indexes[i]=j+1; break; }
            if (indexes[i]==0) throw new IllegalArgumentException("Starter not available in ROM.");
        }
        settings.setStartersMod(false,true,false,false);
        settings.setCustomStarters(indexes);
    }

    public static String generateBabymonSafe(String input, String output, String settings, String seed,
            int left, int middle, int right) {
        try {
            return "OK:" + generateConfigured(input,output,settings,seed,new int[]{left,middle,right},true);
        } catch (Exception e) {
            return "ERROR:" + e.getClass().getSimpleName() + ": " + e.getMessage();
        }
    }

    public static String generateEvolutionSafe(String input, String output, String settings, String seed) {
        try {
            return "OK:" + generateConfigured(input,output,settings,seed,null,true);
        } catch (Exception e) {
            return "ERROR:" + e.getClass().getSimpleName() + ": " + e.getMessage();
        }
    }

    public static void remove(String path) throws Exception {
        Files.deleteIfExists(Paths.get(path));
    }

    public static void main(String[] args) throws Exception {
        if (args.length == 1 && args[0].equals("--nuzlocke")) {
            System.out.println(nuzlockeSettings());
            return;
        }
        if (args.length != 4) throw new IllegalArgumentException(
            "input.gba output.gba settings.txt seed"
        );
        if (
            new File(args[0]).getCanonicalPath().equals(new File(args[1]).getCanonicalPath()) ||
            new File(args[1]).exists()
        ) throw new IllegalArgumentException("Choose a new output file.");
        System.out.println(
            generate(
                args[0],
                args[1],
                new String(Files.readAllBytes(Paths.get(args[2])), "UTF-8"),
                args[3]
            )
        );
    }
}
