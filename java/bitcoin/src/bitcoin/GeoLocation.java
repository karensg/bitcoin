package bitcoin;


import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author karensg
 */
public class GeoLocation {
    
   public static void main(String[] args) throws IOException, JSONException {
       
   
       JSONObject geoLocations = new JSONObject();
       // TODO get all ip's     
       ArrayList ips = new ArrayList();
       ips.add("145.94.46.42");
       ips.add("173.194.65.100");
       ips.add("173.252.110.27");
       JSONObject json;
       for (Integer i=0; i<ips.size(); i++) {
           json = WebApi.readJsonFromUrl("http://ip-api.com/json/" + ips.get(i));
           geoLocations.put(i.toString(), json);
       }
       
       System.out.println(geoLocations.toString());
       
       try {
 
		FileWriter file = new FileWriter("../../locations.json");
		file.write(geoLocations.toString());
		file.flush();
		file.close();
 
	} catch (IOException e) {
		e.printStackTrace();
	}

        
        
  }
}
