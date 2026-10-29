import com.dabomstew.pkrandom.Settings;
import com.dabomstew.pkrandom.pokemon.Pokemon;
import java.util.*;

/** Engine boundary checks; no ROM or emulator required. */
public final class BabymonBridgeTest {
    public static void main(String[] args) throws Exception {
        List<Pokemon> pokemon = new ArrayList<>();
        pokemon.add(null);
        for(int dex=1;dex<=386;dex++) { Pokemon p=new Pokemon();p.number=dex;pokemon.add(p); }
        Settings s=new Settings();
        BaconBridge.configureBabymonStarters(s,pokemon,new int[]{10,79,4});
        if(s.getStartersMod()!=Settings.StartersMod.CUSTOM ||
           !Arrays.equals(s.getCustomStarters(),new int[]{11,80,5}))
            throw new AssertionError("UPR custom-starter index mismatch");
        try {
            BaconBridge.configureBabymonStarters(s,pokemon,new int[]{150,10,79});
            throw new AssertionError("Legendary starter accepted");
        } catch(IllegalArgumentException expected) {}
        try {
            BaconBridge.configureBabymonStarters(s,pokemon,new int[]{14,10,79});
            throw new AssertionError("Tier 2 starter accepted");
        } catch(IllegalArgumentException expected) {}
        System.out.println("Babymon Java bridge starter checks passed.");
    }
}
