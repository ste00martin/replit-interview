import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EvalResponseBody, SerializedType } from '../context/Backend';

const RenderItem = ({ key, data, path, seenPaths, serialized }: { data: SerializedType; path: string; key: string; seenPaths: Set<string>;
  serialized: {
  [key: string]: SerializedType;
}}) => {
  // if (typeof data.value === 'object' && data.value !== null) {
    if (seenPaths.has(path)) {
      return <Text style={styles.circularReference}>[Circular Reference]</Text>;
    }
    seenPaths.add(key);
  // }

  switch (data.type) {
    case 'object':
      let opening = '{'
      let closing = '}'

      return (
        <>
          <Text style={styles.label}>{opening}</Text>
          <View style={{paddingLeft: 30 }}>

          {data.value.map((key, index) => {
            console.log('value is', key)
            serialized[key.key]
            return (
              <RenderItem key={key.key} data={serialized[key.key]} path={`${path}.${index}`} seenPaths={seenPaths} serialized={serialized}/>
            )
          })}
          </View>
          <Text style={styles.label}>{closing}</Text>

        </>
      );

    case 'array':
      let openBraket = '['
      let closedBraket = ']'
      return (
        <>
        <Text style={styles.label}>{openBraket}</Text>
        <View style={{paddingLeft: 30 }}>
          {data.value.map((value, index) => (
            <RenderItem key={value} data={serialized[value]} path={`${path}.${index}`} seenPaths={seenPaths} serialized={serialized}/>
          ))}
        </View>
        <Text style={styles.label}>{closedBraket}</Text>
        </>
      );

    case 'error':
      return (
        <>
          <Text style={styles.errorText}>{data.value.name}: {data.value.message}</Text>
        </>
      );

    case 'undefined':
    case 'string':
    case 'number':
    case 'boolean':
      console.log('')
      return (
        <View style={styles.item}>
          <Text style={styles.value}>{String(data.value)}</Text>
        </View>
      );

    default:
      return null;
  }
};

const SerializedDisplay = ({ response }: { response: EvalResponseBody }) => {
  const seenPaths = new Set<string>();

  return (
    <>
      {Object.entries(response.serialized).map(([key, value]) => (
        <RenderItem key={key} data={value} path={key} seenPaths={seenPaths} serialized={response.serialized}/>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  collapsibleContainer: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  header: {
    padding: 8,
    backgroundColor: '#ddd',
    borderRadius: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    marginTop: 5,
    paddingLeft: 10,
  },
  item: {
    padding: 10,
  },
  value: {
    fontSize: 14,
    color: '#555',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  circularReference: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'orange',
  },
});

export default SerializedDisplay;